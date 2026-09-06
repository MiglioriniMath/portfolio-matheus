(() => {
  const layer = document.getElementById("pet-layer");
  if (!layer) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = window.matchMedia("(max-width: 700px)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const directionRow = { down: 0, left: 1, right: 2, up: 3 };
  const FPS_INTERVAL = 1000 / 30;
  const AUTO_START_MS = 3200;

  let active = false;
  let hidden = document.hidden;
  let rafId = 0;
  let lastFrame = performance.now();
  let lastPaint = 0;
  let startTimer = 0;

  const mouse = { x: -9999, y: -9999, active: false, lastMove: 0 };

  function randomBetween(min, max) { return min + Math.random() * (max - min); }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function face(dx, dy) {
    if (Math.abs(dx) > Math.abs(dy)) return dx >= 0 ? "right" : "left";
    return dy >= 0 ? "down" : "up";
  }

  function setFrame(pet, direction, column) {
    const row = directionRow[direction];
    pet.el.style.backgroundPosition = `${column * 33.333333}% ${row * 33.333333}%`;
  }

  function createPet(name, className, size, wanderSpeed, actionSpeed) {
    const el = document.createElement("div");
    el.className = `pixel-pet ${className}`;
    layer.appendChild(el);
    const pet = {
      name, className, size, wanderSpeed, actionSpeed, el,
      x: 0, y: 0, targetX: 0, targetY: 0,
      direction: "down", state: "seated", nextStateAt: 0,
      nextAnimAt: 0, walkColumn: 1, actionUntil: 0, partner: null
    };
    setFrame(pet, "down", 0);
    return pet;
  }

  const hamtaro = createPet("Hamtaro", "hamtaro", isMobile ? 45 : 54, isMobile ? 27 : 40, isMobile ? 64 : 92);
  const totoro = createPet("Totoro", "totoro", isMobile ? 49 : 59, isMobile ? 18 : 19, isMobile ? 48 : 80);
  hamtaro.partner = totoro;
  totoro.partner = hamtaro;
  const pets = [hamtaro, totoro];

  function render(pet) {
    pet.el.style.left = `${Math.round(pet.x)}px`;
    pet.el.style.top = `${Math.round(pet.y)}px`;
  }

  function bounds(pet) {
    const half = pet.size * .54;
    return {
      left: 16 + half,
      right: window.innerWidth - 16 - half,
      top: 64 + half,
      bottom: window.innerHeight - 14 - half
    };
  }

  function clampPet(pet) {
    const b = bounds(pet);
    pet.x = clamp(pet.x, b.left, b.right);
    pet.y = clamp(pet.y, b.top, b.bottom);
  }

  function seatPets() {
    layer.classList.add("pets-seated");

    let baseY;
    const right = window.innerWidth - (isMobile ? 29 : 34);

    if (isMobile) {
      // Mobile: true fixed bottom-right resting spot.
      // No footer/layout measurement, so they cannot jump around on first paint.
      baseY = window.innerHeight - 43;
    } else {
      // Desktop behavior remains exactly as before.
      const footer = document.querySelector(".mac-footer");
      const footerTop = footer ? footer.getBoundingClientRect().top : window.innerHeight - 65;
      baseY = clamp(footerTop - 12, 95, window.innerHeight - 42);
    }

    totoro.x = right;
    totoro.y = baseY;
    hamtaro.x = right - (isMobile ? 43 : 53);
    hamtaro.y = baseY + 1;

    for (const pet of pets) {
      pet.state = "seated";
      pet.direction = "down";
      pet.el.classList.remove("is-walking", "is-running", "is-sleeping");
      setFrame(pet, "down", 0);
      render(pet);
    }
  }

  function chooseTarget(pet) {
    const b = bounds(pet);
    pet.targetX = randomBetween(b.left, b.right);
    pet.targetY = randomBetween(b.top + (b.bottom - b.top) * .10, b.bottom);
    pet.state = "wander";
  }

  function moveToward(pet, tx, ty, speed, dt) {
    const dx = tx - pet.x;
    const dy = ty - pet.y;
    const dist = Math.hypot(dx, dy);
    if (dist < .01) return dist;
    pet.direction = face(dx, dy);
    const step = Math.min(dist, speed * dt);
    pet.x += dx / dist * step;
    pet.y += dy / dist * step;
    return dist;
  }

  function visual(pet, className = "") {
    pet.el.classList.remove("is-walking", "is-running", "is-sleeping");
    if (className) pet.el.classList.add(className);
  }

  function sleep(pet, now) {
    pet.state = "sleep";
    pet.nextStateAt = now + (pet.name === "Totoro" ? randomBetween(4200,7600) : randomBetween(1200,2300));
    visual(pet, "is-sleeping");
    setFrame(pet, pet.direction, 0);
  }

  function animateWalk(pet, now, fast = false) {
    if (now < pet.nextAnimAt) return;
    if (fast) pet.walkColumn = pet.walkColumn === 2 ? 3 : 2;
    else pet.walkColumn = pet.walkColumn === 1 ? 2 : 1;
    setFrame(pet, pet.direction, pet.walkColumn);
    pet.nextAnimAt = now + (fast ? 120 : pet.name === "Hamtaro" ? 190 : 275);
  }

  function updateHamtaro(now, dt) {
    const mouseRecent = finePointer && mouse.active && now - mouse.lastMove < 1600;
    const mouseDist = mouseRecent ? Math.hypot(mouse.x - hamtaro.x, mouse.y - hamtaro.y) : Infinity;

    if (mouseDist < 112 && hamtaro.state !== "flee" && Math.random() < .72) {
      hamtaro.state = "flee";
      hamtaro.actionUntil = now + randomBetween(650,1200);
    }

    if (hamtaro.state === "flee") {
      visual(hamtaro, "is-running");
      let dx = hamtaro.x - mouse.x, dy = hamtaro.y - mouse.y;
      let d = Math.hypot(dx,dy) || 1;
      moveToward(hamtaro, hamtaro.x + dx/d*120, hamtaro.y + dy/d*120, hamtaro.actionSpeed, dt);
      animateWalk(hamtaro, now, true);
      if (now >= hamtaro.actionUntil || mouseDist > 175) {
        hamtaro.state = "idle";
        hamtaro.nextStateAt = now + randomBetween(220,540);
      }
      clampPet(hamtaro);
      return;
    }

    if (hamtaro.state === "follow") {
      visual(hamtaro, "is-walking");
      const dist = Math.hypot(totoro.x-hamtaro.x, totoro.y-hamtaro.y);
      if (dist > 54) {
        moveToward(hamtaro, totoro.x, totoro.y, hamtaro.wanderSpeed*1.2, dt);
        animateWalk(hamtaro, now);
      } else setFrame(hamtaro, hamtaro.direction, 0);
      if (now >= hamtaro.actionUntil) {
        hamtaro.state = "idle";
        hamtaro.nextStateAt = now + randomBetween(250,600);
      }
      return;
    }

    if (hamtaro.state === "sleep") {
      visual(hamtaro, "is-sleeping");
      if (now >= hamtaro.nextStateAt) { hamtaro.state="idle"; hamtaro.nextStateAt=now+250; }
      return;
    }

    if (hamtaro.state === "wander") {
      visual(hamtaro, "is-walking");
      const dist = moveToward(hamtaro, hamtaro.targetX, hamtaro.targetY, hamtaro.wanderSpeed, dt);
      animateWalk(hamtaro, now);
      if (dist < 7) { hamtaro.state="idle"; hamtaro.nextStateAt=now+randomBetween(180,520); }
      clampPet(hamtaro);
      return;
    }

    visual(hamtaro);
    setFrame(hamtaro, hamtaro.direction, 0);
    if (now >= hamtaro.nextStateAt) {
      const roll=Math.random();
      if (roll < .04) sleep(hamtaro,now);
      else if (roll < .28) { hamtaro.state="follow"; hamtaro.actionUntil=now+randomBetween(2000,3800); }
      else chooseTarget(hamtaro);
    }
  }

  function updateTotoro(now, dt) {
    const mouseRecent = finePointer && mouse.active && now - mouse.lastMove < 1800;
    const mouseDist = mouseRecent ? Math.hypot(mouse.x-totoro.x, mouse.y-totoro.y) : Infinity;
    if (mouseDist < 165 || (totoro.state === "chase" && mouseDist < 225)) totoro.state = "chase";

    if (totoro.state === "chase") {
      visual(totoro, "is-running");
      const dist = moveToward(totoro, mouse.x, mouse.y, totoro.actionSpeed, dt);
      animateWalk(totoro, now, true);
      if (!mouseRecent || dist > 225) { totoro.state="idle"; totoro.nextStateAt=now+randomBetween(600,1200); }
      clampPet(totoro);
      return;
    }

    if (totoro.state === "sleep") {
      visual(totoro, "is-sleeping");
      if (now >= totoro.nextStateAt) { totoro.state="idle"; totoro.nextStateAt=now+randomBetween(600,1500); }
      return;
    }

    if (totoro.state === "wander") {
      visual(totoro, "is-walking");
      const dist = moveToward(totoro, totoro.targetX, totoro.targetY, totoro.wanderSpeed, dt);
      animateWalk(totoro, now);
      if (dist < 7) {
        if (Math.random() < .52) sleep(totoro,now);
        else { totoro.state="idle"; totoro.nextStateAt=now+randomBetween(900,2000); }
      }
      clampPet(totoro);
      return;
    }

    visual(totoro);
    setFrame(totoro, totoro.direction, 0);
    if (now >= totoro.nextStateAt) {
      if (Math.random() < .46) sleep(totoro,now);
      else chooseTarget(totoro);
    }
  }

  function separatePets() {
    const dx=totoro.x-hamtaro.x, dy=totoro.y-hamtaro.y;
    const d=Math.hypot(dx,dy), minD=isMobile?35:40;
    if (d>0 && d<minD) {
      const push=(minD-d)*.32;
      hamtaro.x-=dx/d*push; hamtaro.y-=dy/d*push;
      totoro.x+=dx/d*push; totoro.y+=dy/d*push;
      clampPet(hamtaro); clampPet(totoro);
    }
  }

  function tick(now) {
    if (!active || hidden) { rafId=0; return; }
    if (now-lastPaint < FPS_INTERVAL) { rafId=requestAnimationFrame(tick); return; }
    const dt=Math.min(.05,(now-lastFrame)/1000);
    lastFrame=now; lastPaint=now;
    updateHamtaro(now,dt); updateTotoro(now,dt); separatePets();
    render(hamtaro); render(totoro);
    rafId=requestAnimationFrame(tick);
  }

  function activate() {
    if (active || reducedMotion) return;
    active=true;
    layer.classList.remove("pets-seated");
    const now=performance.now();
    hamtaro.state="wander"; totoro.state="wander";
    hamtaro.targetX=Math.max(40,hamtaro.x-randomBetween(70,145));
    hamtaro.targetY=Math.max(80,hamtaro.y-randomBetween(55,120));
    totoro.targetX=Math.max(40,totoro.x-randomBetween(55,115));
    totoro.targetY=Math.max(80,totoro.y-randomBetween(45,100));
    lastFrame=lastPaint=now;
    if (!hidden && !rafId) rafId=requestAnimationFrame(tick);
  }

  if (finePointer) {
    window.addEventListener("pointermove", e => {
      mouse.x=e.clientX; mouse.y=e.clientY; mouse.active=true; mouse.lastMove=performance.now();
    }, {passive:true});
    window.addEventListener("blur",()=>{ mouse.active=false; },{passive:true});
  }

  let mobileTapCount = 0;
  let lastMobileTap = 0;

  function wakeEarly(e) {
    if (!isMobile || active) return;

    // This handler exists ONLY on the two pet elements.
    // Tapping anywhere else on the site does not count.
    const now = performance.now();

    if (now - lastMobileTap > 1200) {
      mobileTapCount = 0;
    }

    lastMobileTap = now;
    mobileTapCount += 1;

    layer.classList.remove("pet-tap-1", "pet-tap-2");
    if (mobileTapCount === 1) layer.classList.add("pet-tap-1");
    if (mobileTapCount === 2) layer.classList.add("pet-tap-2");

    if (mobileTapCount >= 3) {
      clearTimeout(startTimer);
      mobileTapCount = 0;
      layer.classList.remove("pet-tap-1", "pet-tap-2");
      activate();
    }
  }

  hamtaro.el.addEventListener("pointerup", wakeEarly);
  totoro.el.addEventListener("pointerup", wakeEarly);

  document.addEventListener("visibilitychange",()=>{
    hidden=document.hidden;
    if (hidden && rafId) { cancelAnimationFrame(rafId); rafId=0; }
    if (!hidden && active && !rafId && !reducedMotion) {
      lastFrame=lastPaint=performance.now(); rafId=requestAnimationFrame(tick);
    }
  });

  window.addEventListener("resize",()=>{
    if (!active) seatPets();
    else { pets.forEach(clampPet); pets.forEach(render); }
  },{passive:true});

  seatPets();
  if (!reducedMotion && !isMobile) {
    startTimer = window.setTimeout(activate, AUTO_START_MS);
  }
})();
