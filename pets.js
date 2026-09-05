
(() => {
  const layer = document.getElementById("pet-layer");
  if (!layer) return;
  if (window.matchMedia("(max-width: 700px)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const mouse = {
    x: -9999,
    y: -9999,
    active: false,
    lastMove: 0,
  };

  window.addEventListener("mousemove", (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    mouse.active = true;
    mouse.lastMove = performance.now();
  }, { passive: true });

  window.addEventListener("mouseleave", () => {
    mouse.active = false;
  });

  function boundsFor(pet) {
    const margin = 28;
    const half = pet.size * 0.5;
    return {
      left: margin + half,
      right: window.innerWidth - margin - half,
      top: 34 + half,
      bottom: window.innerHeight - 28 - half,
    };
  }

  const directionRow = { down: 0, left: 1, right: 2, up: 3 };

  function setFrame(pet, direction, column) {
    const row = directionRow[direction];
    const x = column * 33.333333;
    const y = row * 33.333333;
    pet.el.style.backgroundPosition = `${x}% ${y}%`;
  }

  function randomBetween(min, max) {
    return min + Math.random() * Math.max(0, max - min);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function createPet(options) {
    const el = document.createElement("div");
    el.className = `pixel-pet ${options.className}`;
    layer.appendChild(el);

    const pet = {
      el,
      name: options.name,
      size: options.size,
      x: window.innerWidth * options.startX,
      y: window.innerHeight * options.startY,
      targetX: 0,
      targetY: 0,
      direction: options.direction,
      state: "idle",
      wanderSpeed: options.wanderSpeed,
      chaseSpeed: options.chaseSpeed,
      chaseRadius: options.chaseRadius,
      releaseRadius: options.releaseRadius,
      playfulness: options.playfulness,
      curiosity: options.curiosity,
      nextStateAt: performance.now() + randomBetween(900, 1800),
      nextAnimAt: 0,
      walkColumn: 1,
      partner: null,
      playUntil: 0,
    };

    clampIntoBounds(pet);
    setFrame(pet, pet.direction, 0);
    return pet;
  }

  function clampIntoBounds(pet) {
    const b = boundsFor(pet);
    pet.x = clamp(pet.x, b.left, b.right);
    pet.y = clamp(pet.y, b.top, b.bottom);
  }

  function chooseWanderTarget(pet) {
    const b = boundsFor(pet);
    pet.targetX = randomBetween(b.left, b.right);
    pet.targetY = randomBetween(b.top, b.bottom);
    pet.state = "wander";
    pet.nextAnimAt = 0;
  }

  function faceFromVector(dx, dy) {
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx >= 0 ? "right" : "left";
    }
    return dy >= 0 ? "down" : "up";
  }

  function moveToward(pet, tx, ty, speed, dt) {
    const dx = tx - pet.x;
    const dy = ty - pet.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 0.01) return dist;

    pet.direction = faceFromVector(dx, dy);
    const step = Math.min(dist, speed * dt);
    pet.x += (dx / dist) * step;
    pet.y += (dy / dist) * step;
    return dist;
  }

  const pets = [
    createPet({
      name: "Hamtaro",
      className: "hamtaro",
      size: 58,
      startX: 0.22,
      startY: 0.70,
      direction: "right",
      wanderSpeed: 30,
      chaseSpeed: 96,
      chaseRadius: 160,
      releaseRadius: 220,
      playfulness: 0.92,
      curiosity: 1.00,
    }),
    createPet({
      name: "Totoro",
      className: "totoro",
      size: 64,
      startX: 0.78,
      startY: 0.76,
      direction: "left",
      wanderSpeed: 22,
      chaseSpeed: 78,
      chaseRadius: 145,
      releaseRadius: 210,
      playfulness: 0.72,
      curiosity: 0.85,
    }),
  ];

  pets[0].partner = pets[1];
  pets[1].partner = pets[0];

  function setClassState(pet, className) {
    pet.el.classList.remove("is-walking", "is-running", "is-sleeping");
    if (className) pet.el.classList.add(className);
  }

  function tryStartPlay(now) {
    const [a, b] = pets;
    if (a.state === "chase-mouse" || b.state === "chase-mouse") return;
    if (a.state === "sleep" || b.state === "sleep") return;

    const dist = Math.hypot(a.x - b.x, a.y - b.y);
    if (dist > 240 && Math.random() < 0.02) {
      const leader = Math.random() < 0.6 ? a : b;
      const follower = leader.partner;
      leader.state = "play-lead";
      leader.playUntil = now + randomBetween(2600, 4200);
      chooseWanderTarget(leader);
      follower.state = "play-follow";
      follower.playUntil = leader.playUntil;
    }
  }

  function updatePet(pet, now, dt) {
    const other = pet.partner;
    const mouseDistance = mouse.active ? Math.hypot(mouse.x - pet.x, mouse.y - pet.y) : Infinity;
    const wantsMouse =
      mouse.active &&
      now - mouse.lastMove < 1800 &&
      (mouseDistance < pet.chaseRadius || (pet.state === "chase-mouse" && mouseDistance < pet.releaseRadius));

    if (wantsMouse && Math.random() <= pet.curiosity) {
      pet.state = "chase-mouse";
    } else if (pet.state === "chase-mouse" && !wantsMouse) {
      pet.state = "idle";
      pet.nextStateAt = now + randomBetween(650, 1400);
    }

    switch (pet.state) {
      case "sleep": {
        setClassState(pet, "is-sleeping");
        setFrame(pet, pet.direction, 0);
        if (now >= pet.nextStateAt) {
          pet.state = "idle";
          pet.nextStateAt = now + randomBetween(400, 1100);
          setClassState(pet, "");
        }
        break;
      }

      case "chase-mouse": {
        setClassState(pet, "is-running");
        const dist = moveToward(pet, mouse.x, mouse.y, pet.chaseSpeed, dt);
        if (now >= pet.nextAnimAt) {
          pet.walkColumn = pet.walkColumn === 2 ? 3 : 2;
          setFrame(pet, pet.direction, pet.walkColumn);
          pet.nextAnimAt = now + 105;
        }
        if (dist < 18) setFrame(pet, pet.direction, 0);
        break;
      }

      case "play-lead": {
        setClassState(pet, "is-running");

        if (now >= pet.playUntil) {
          pet.state = "idle";
          pet.nextStateAt = now + randomBetween(800, 1500);
          break;
        }

        let dist = moveToward(pet, pet.targetX, pet.targetY, pet.wanderSpeed * 2.2, dt);
        if (dist < 10) chooseWanderTarget(pet);

        if (now >= pet.nextAnimAt) {
          pet.walkColumn = pet.walkColumn === 2 ? 3 : 2;
          setFrame(pet, pet.direction, pet.walkColumn);
          pet.nextAnimAt = now + 115;
        }
        break;
      }

      case "play-follow": {
        setClassState(pet, "is-running");

        if (now >= pet.playUntil || !other) {
          pet.state = "idle";
          pet.nextStateAt = now + randomBetween(800, 1500);
          break;
        }

        moveToward(pet, other.x, other.y, pet.chaseSpeed * 0.85, dt);

        if (now >= pet.nextAnimAt) {
          pet.walkColumn = pet.walkColumn === 2 ? 3 : 2;
          setFrame(pet, pet.direction, pet.walkColumn);
          pet.nextAnimAt = now + 120;
        }
        break;
      }

      case "wander": {
        setClassState(pet, "is-walking");
        const dist = moveToward(pet, pet.targetX, pet.targetY, pet.wanderSpeed, dt);

        if (now >= pet.nextAnimAt) {
          pet.walkColumn = pet.walkColumn === 1 ? 2 : 1;
          setFrame(pet, pet.direction, pet.walkColumn);
          pet.nextAnimAt = now + 240;
        }

        if (dist < 8) {
          const sleepChance = pet.name === "Totoro" ? 0.26 : 0.12;
          pet.state = Math.random() < sleepChance ? "sleep" : "idle";
          pet.nextStateAt = now + (pet.state === "sleep" ? randomBetween(2400, 5200) : randomBetween(700, 1800));
          setFrame(pet, pet.direction, 0);
          setClassState(pet, pet.state === "sleep" ? "is-sleeping" : "");
        }
        break;
      }

      case "idle":
      default: {
        setClassState(pet, "");
        setFrame(pet, pet.direction, 0);

        if (now >= pet.nextStateAt) {
          if (Math.random() < (pet.name === "Totoro" ? 0.20 : 0.10)) {
            pet.state = "sleep";
            pet.nextStateAt = now + randomBetween(2400, 5200);
            setClassState(pet, "is-sleeping");
          } else {
            chooseWanderTarget(pet);
          }
        }
        break;
      }
    }

    clampIntoBounds(pet);
  }

  function avoidOverlap() {
    const [a, b] = pets;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const d = Math.hypot(dx, dy);
    const minD = 44;
    if (d > 0 && d < minD) {
      const push = (minD - d) * 0.5;
      a.x -= (dx / d) * push * 0.5;
      a.y -= (dy / d) * push * 0.5;
      b.x += (dx / d) * push * 0.5;
      b.y += (dy / d) * push * 0.5;
      clampIntoBounds(a);
      clampIntoBounds(b);
    }
  }

  function renderPet(pet) {
    pet.el.style.left = `${pet.x}px`;
    pet.el.style.top = `${pet.y}px`;
  }

  let last = performance.now();

  function tick(now) {
    const dt = Math.min(0.04, (now - last) / 1000);
    last = now;

    if (Math.random() < 0.009) {
      tryStartPlay(now);
    }

    pets.forEach((pet) => updatePet(pet, now, dt));
    avoidOverlap();
    pets.forEach(renderPet);

    requestAnimationFrame(tick);
  }

  window.addEventListener("resize", () => {
    pets.forEach((pet) => clampIntoBounds(pet));
  }, { passive: true });

  pets.forEach(renderPet);
  requestAnimationFrame(tick);
})();
