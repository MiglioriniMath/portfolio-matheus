
(() => {
  const layer = document.getElementById("pet-layer");
  if (!layer) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const isMobile = window.matchMedia("(max-width: 700px)").matches;

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

  function faceFromVector(dx, dy) {
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx >= 0 ? "right" : "left";
    }
    return dy >= 0 ? "down" : "up";
  }

  function createPet(options) {
    const el = document.createElement("div");
    el.className = `pixel-pet ${options.className}`;
    layer.appendChild(el);

    const pet = {
      el,
      name: options.name,
      size: options.size,
      x: options.x || 0,
      y: options.y || 0,
      targetX: 0,
      targetY: 0,
      direction: options.direction || "down",
      state: "idle",
      nextStateAt: performance.now() + randomBetween(500, 1200),
      nextAnimAt: 0,
      walkColumn: 1,
      wanderSpeed: options.wanderSpeed || 24,
      actionSpeed: options.actionSpeed || 80,
      partner: null,
      actionUntil: 0,
    };

    setFrame(pet, pet.direction, 0);
    return pet;
  }

  function render(pet) {
    pet.el.style.left = `${pet.x}px`;
    pet.el.style.top = `${pet.y}px`;
  }

  function moveToward(pet, tx, ty, speed, dt) {
    const dx = tx - pet.x;
    const dy = ty - pet.y;
    const dist = Math.hypot(dx, dy);

    if (dist < .01) return dist;

    pet.direction = faceFromVector(dx, dy);
    const step = Math.min(dist, speed * dt);
    pet.x += (dx / dist) * step;
    pet.y += (dy / dist) * step;
    return dist;
  }

  function setVisualState(pet, name) {
    pet.el.classList.remove("is-walking", "is-running", "is-sleeping");
    if (name) pet.el.classList.add(name);
  }

  /* =========================================================
     MOBILE MODE
     ========================================================= */
  if (isMobile) {
    layer.classList.add("mobile-pets-idle");

    const hamtaro = createPet({
      name: "Hamtaro",
      className: "hamtaro",
      size: 48,
      direction: "down",
      wanderSpeed: 26,
      actionSpeed: 62,
    });

    const totoro = createPet({
      name: "Totoro",
      className: "totoro",
      size: 52,
      direction: "down",
      wanderSpeed: 18,
      actionSpeed: 48,
    });

    hamtaro.partner = totoro;
    totoro.partner = hamtaro;

    const pets = [hamtaro, totoro];
    let active = false;
    let last = performance.now();

    function pageSize() {
      const body = document.body;
      const html = document.documentElement;

      return {
        width: Math.max(
          html.clientWidth,
          body ? body.scrollWidth : 0,
          html.scrollWidth
        ),
        height: Math.max(
          html.clientHeight,
          body ? body.scrollHeight : 0,
          html.scrollHeight
        ),
      };
    }

    function syncLayerHeight() {
      const size = pageSize();
      layer.style.height = `${size.height}px`;
    }

    function mobileBounds(pet) {
      const size = pageSize();
      const half = pet.size * .52;

      return {
        left: 18 + half,
        right: size.width - 18 - half,
        top: 72 + half,
        bottom: size.height - 22 - half,
      };
    }

    function clampPet(pet) {
      const b = mobileBounds(pet);
      pet.x = clamp(pet.x, b.left, b.right);
      pet.y = clamp(pet.y, b.top, b.bottom);
    }

    /*
      Initial seated pair lives at the actual end of the document.
      It will not follow the viewport while the person scrolls.
    */
    function seatPets() {
      syncLayerHeight();
      const size = pageSize();

      const right = size.width - 34;
      const bottom = size.height - 47;

      totoro.x = right;
      totoro.y = bottom;
      totoro.direction = "down";

      hamtaro.x = right - 47;
      hamtaro.y = bottom + 1;
      hamtaro.direction = "down";

      setVisualState(hamtaro, "");
      setVisualState(totoro, "");
      setFrame(hamtaro, "down", 0);
      setFrame(totoro, "down", 0);

      pets.forEach(render);
    }

    function chooseMobileTarget(pet) {
      const b = mobileBounds(pet);

      pet.targetX = randomBetween(b.left, b.right);

      /*
        Keep most roaming around the lower 75% of the page.
        They still explore the site, but won't constantly cover the header.
      */
      const roamingTop = Math.max(
        b.top,
        b.top + (b.bottom - b.top) * .25
      );

      pet.targetY = randomBetween(roamingTop, b.bottom);
      pet.state = "wander";
    }

    function startMobileSleep(pet, now) {
      pet.state = "sleep";
      pet.nextStateAt = now + (
        pet.name === "Totoro"
          ? randomBetween(4200, 7800)
          : randomBetween(1200, 2400)
      );
      setVisualState(pet, "is-sleeping");
      setFrame(pet, pet.direction, 0);
    }

    function activatePets() {
      if (active) return;

      active = true;
      layer.classList.remove("mobile-pets-idle");
      layer.classList.add("mobile-pets-active");

      hamtaro.state = "wander";
      totoro.state = "wander";

      hamtaro.targetX = Math.max(40, hamtaro.x - randomBetween(80, 150));
      hamtaro.targetY = Math.max(90, hamtaro.y - randomBetween(70, 150));

      totoro.targetX = Math.max(40, totoro.x - randomBetween(60, 120));
      totoro.targetY = Math.max(90, totoro.y - randomBetween(45, 110));

      last = performance.now();
      requestAnimationFrame(tick);
    }

    /*
      Two quick taps on either pig wake both of them.
      Pointer Events work more consistently than dblclick on touch devices.
    */
    let lastTapAt = 0;
    let lastTapTarget = null;

    function onPetTap(event) {
      event.preventDefault();

      const now = performance.now();
      const sameTarget = lastTapTarget === event.currentTarget;

      if (sameTarget && now - lastTapAt <= 420) {
        lastTapAt = 0;
        lastTapTarget = null;
        activatePets();
      } else {
        lastTapAt = now;
        lastTapTarget = event.currentTarget;
      }
    }

    hamtaro.el.addEventListener("pointerup", onPetTap);
    totoro.el.addEventListener("pointerup", onPetTap);

    function updateMobilePet(pet, now, dt) {
      if (pet.state === "sleep") {
        setVisualState(pet, "is-sleeping");
        setFrame(pet, pet.direction, 0);

        if (now >= pet.nextStateAt) {
          pet.state = "idle";
          pet.nextStateAt = now + (
            pet.name === "Totoro"
              ? randomBetween(700, 1800)
              : randomBetween(180, 550)
          );
        }
        return;
      }

      if (pet.state === "wander") {
        setVisualState(pet, "is-walking");

        const dist = moveToward(
          pet,
          pet.targetX,
          pet.targetY,
          pet.wanderSpeed,
          dt
        );

        if (now >= pet.nextAnimAt) {
          pet.walkColumn = pet.walkColumn === 1 ? 2 : 1;
          setFrame(pet, pet.direction, pet.walkColumn);
          pet.nextAnimAt = now + (
            pet.name === "Hamtaro" ? 185 : 270
          );
        }

        if (dist < 7) {
          const sleepChance =
            pet.name === "Totoro" ? .55 : .08;

          if (Math.random() < sleepChance) {
            startMobileSleep(pet, now);
          } else {
            pet.state = "idle";
            pet.nextStateAt = now + (
              pet.name === "Totoro"
                ? randomBetween(900, 2200)
                : randomBetween(180, 650)
            );
          }
        }

        clampPet(pet);
        return;
      }

      setVisualState(pet, "");
      setFrame(pet, pet.direction, 0);

      if (now >= pet.nextStateAt) {
        if (
          pet.name === "Hamtaro" &&
          Math.random() < .28 &&
          pet.partner
        ) {
          pet.targetX = pet.partner.x + randomBetween(-28, 28);
          pet.targetY = pet.partner.y + randomBetween(-28, 28);
          pet.state = "wander";
        } else if (
          pet.name === "Totoro" &&
          Math.random() < .42
        ) {
          startMobileSleep(pet, now);
        } else {
          chooseMobileTarget(pet);
        }
      }
    }

    function avoidOverlap() {
      const dx = totoro.x - hamtaro.x;
      const dy = totoro.y - hamtaro.y;
      const d = Math.hypot(dx, dy);
      const minD = 40;

      if (d > 0 && d < minD) {
        const push = (minD - d) * .4;
        hamtaro.x -= (dx / d) * push;
        hamtaro.y -= (dy / d) * push;
        totoro.x += (dx / d) * push;
        totoro.y += (dy / d) * push;
        clampPet(hamtaro);
        clampPet(totoro);
      }
    }

    function tick(now) {
      if (!active) return;

      const dt = Math.min(.04, (now - last) / 1000);
      last = now;

      updateMobilePet(hamtaro, now, dt);
      updateMobilePet(totoro, now, dt);
      avoidOverlap();

      pets.forEach(render);
      requestAnimationFrame(tick);
    }

    function refreshMobileStage() {
      syncLayerHeight();

      if (!active) {
        seatPets();
      } else {
        pets.forEach(clampPet);
        pets.forEach(render);
      }
    }

    window.addEventListener("resize", refreshMobileStage, { passive: true });
    window.addEventListener("load", refreshMobileStage, { once: true });

    if ("ResizeObserver" in window) {
      const observer = new ResizeObserver(refreshMobileStage);
      observer.observe(document.body);
    }

    seatPets();
    return;
  }

  /* =========================================================
     DESKTOP MODE — current V9.5 personality behavior
     ========================================================= */

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

  function desktopBounds(pet) {
    const margin = 26;
    const half = pet.size * .5;
    return {
      left: margin + half,
      right: window.innerWidth - margin - half,
      top: 30 + half,
      bottom: window.innerHeight - 26 - half,
    };
  }

  function clampDesktop(pet) {
    const b = desktopBounds(pet);
    pet.x = clamp(pet.x, b.left, b.right);
    pet.y = clamp(pet.y, b.top, b.bottom);
  }

  function chooseDesktopTarget(pet) {
    const b = desktopBounds(pet);
    pet.targetX = randomBetween(b.left, b.right);
    pet.targetY = randomBetween(b.top, b.bottom);
    pet.state = "wander";
    pet.nextAnimAt = 0;
  }

  function startDesktopSleep(pet, now) {
    pet.state = "sleep";
    pet.nextStateAt = now + (
      pet.name === "Totoro"
        ? randomBetween(4800, 9000)
        : randomBetween(1600, 3000)
    );
    setFrame(pet, pet.direction, 0);
    setVisualState(pet, "is-sleeping");
  }

  const hamtaro = createPet({
    name: "Hamtaro",
    className: "hamtaro",
    size: 58,
    x: window.innerWidth * .24,
    y: window.innerHeight * .68,
    direction: "right",
    wanderSpeed: 40,
    actionSpeed: 92,
  });

  const totoro = createPet({
    name: "Totoro",
    className: "totoro",
    size: 64,
    x: window.innerWidth * .76,
    y: window.innerHeight * .76,
    direction: "left",
    wanderSpeed: 18,
    actionSpeed: 80,
  });

  hamtaro.partner = totoro;
  totoro.partner = hamtaro;

  const pets = [hamtaro, totoro];

  function startHamtaroFollow(now) {
    hamtaro.state = "follow-totoro";
    hamtaro.actionUntil = now + randomBetween(2200, 4300);
  }

  function startHamtaroFlee(now) {
    hamtaro.state = "flee-mouse";
    hamtaro.actionUntil = now + randomBetween(650, 1300);
  }

  function updateHamtaro(now, dt) {
    const mouseRecent = mouse.active && now - mouse.lastMove < 1600;
    const mouseDistance = mouseRecent
      ? Math.hypot(mouse.x - hamtaro.x, mouse.y - hamtaro.y)
      : Infinity;

    if (
      mouseDistance < 115 &&
      hamtaro.state !== "flee-mouse" &&
      Math.random() < .72
    ) {
      startHamtaroFlee(now);
    }

    if (hamtaro.state === "flee-mouse") {
      setVisualState(hamtaro, "is-running");

      let dx = hamtaro.x - mouse.x;
      let dy = hamtaro.y - mouse.y;
      let d = Math.hypot(dx, dy);

      if (d < 1) {
        dx = Math.random() - .5;
        dy = Math.random() - .5;
        d = Math.hypot(dx, dy) || 1;
      }

      const tx = hamtaro.x + (dx / d) * 130;
      const ty = hamtaro.y + (dy / d) * 130;
      moveToward(hamtaro, tx, ty, hamtaro.actionSpeed * 1.15, dt);

      if (now >= hamtaro.nextAnimAt) {
        hamtaro.walkColumn = hamtaro.walkColumn === 2 ? 3 : 2;
        setFrame(hamtaro, hamtaro.direction, hamtaro.walkColumn);
        hamtaro.nextAnimAt = now + 105;
      }

      if (now >= hamtaro.actionUntil || mouseDistance > 180) {
        hamtaro.state = "idle";
        hamtaro.nextStateAt = now + randomBetween(180, 520);
      }

      clampDesktop(hamtaro);
      return;
    }

    if (hamtaro.state === "follow-totoro") {
      setVisualState(hamtaro, "is-walking");

      const dist = Math.hypot(
        totoro.x - hamtaro.x,
        totoro.y - hamtaro.y
      );

      if (dist > 58) {
        moveToward(
          hamtaro,
          totoro.x,
          totoro.y,
          hamtaro.wanderSpeed * 1.25,
          dt
        );

        if (now >= hamtaro.nextAnimAt) {
          hamtaro.walkColumn = hamtaro.walkColumn === 1 ? 2 : 1;
          setFrame(hamtaro, hamtaro.direction, hamtaro.walkColumn);
          hamtaro.nextAnimAt = now + 190;
        }
      } else {
        setFrame(hamtaro, hamtaro.direction, 0);
      }

      if (now >= hamtaro.actionUntil) {
        hamtaro.state = "idle";
        hamtaro.nextStateAt = now + randomBetween(250, 650);
      }

      clampDesktop(hamtaro);
      return;
    }

    if (hamtaro.state === "sleep") {
      setVisualState(hamtaro, "is-sleeping");
      setFrame(hamtaro, hamtaro.direction, 0);

      if (now >= hamtaro.nextStateAt) {
        hamtaro.state = "idle";
        hamtaro.nextStateAt = now + randomBetween(150, 450);
      }
      return;
    }

    if (hamtaro.state === "wander") {
      setVisualState(hamtaro, "is-walking");
      const dist = moveToward(
        hamtaro,
        hamtaro.targetX,
        hamtaro.targetY,
        hamtaro.wanderSpeed,
        dt
      );

      if (now >= hamtaro.nextAnimAt) {
        hamtaro.walkColumn = hamtaro.walkColumn === 1 ? 2 : 1;
        setFrame(hamtaro, hamtaro.direction, hamtaro.walkColumn);
        hamtaro.nextAnimAt = now + 175;
      }

      if (dist < 7) {
        hamtaro.state = "idle";
        hamtaro.nextStateAt = now + randomBetween(160, 520);
      }

      clampDesktop(hamtaro);
      return;
    }

    setVisualState(hamtaro, "");
    setFrame(hamtaro, hamtaro.direction, 0);

    if (now >= hamtaro.nextStateAt) {
      const roll = Math.random();

      if (roll < .04) {
        startDesktopSleep(hamtaro, now);
      } else if (roll < .30) {
        startHamtaroFollow(now);
      } else {
        chooseDesktopTarget(hamtaro);
      }
    }
  }

  function updateTotoro(now, dt) {
    const mouseRecent = mouse.active && now - mouse.lastMove < 1900;
    const mouseDistance = mouseRecent
      ? Math.hypot(mouse.x - totoro.x, mouse.y - totoro.y)
      : Infinity;

    const shouldChase =
      mouseDistance < 170 ||
      (totoro.state === "chase-mouse" && mouseDistance < 235);

    if (shouldChase) {
      totoro.state = "chase-mouse";
    }

    if (totoro.state === "chase-mouse") {
      setVisualState(totoro, "is-running");
      const dist = moveToward(
        totoro,
        mouse.x,
        mouse.y,
        totoro.actionSpeed,
        dt
      );

      if (now >= totoro.nextAnimAt) {
        totoro.walkColumn = totoro.walkColumn === 2 ? 3 : 2;
        setFrame(totoro, totoro.direction, totoro.walkColumn);
        totoro.nextAnimAt = now + 115;
      }

      if (!mouseRecent || dist > 235) {
        totoro.state = "idle";
        totoro.nextStateAt = now + randomBetween(500, 1100);
      }

      clampDesktop(totoro);
      return;
    }

    if (totoro.state === "sleep") {
      setVisualState(totoro, "is-sleeping");
      setFrame(totoro, totoro.direction, 0);

      if (now >= totoro.nextStateAt) {
        totoro.state = "idle";
        totoro.nextStateAt = now + randomBetween(700, 1700);
      }
      return;
    }

    if (totoro.state === "wander") {
      setVisualState(totoro, "is-walking");
      const dist = moveToward(
        totoro,
        totoro.targetX,
        totoro.targetY,
        totoro.wanderSpeed,
        dt
      );

      if (now >= totoro.nextAnimAt) {
        totoro.walkColumn = totoro.walkColumn === 1 ? 2 : 1;
        setFrame(totoro, totoro.direction, totoro.walkColumn);
        totoro.nextAnimAt = now + 275;
      }

      if (dist < 7) {
        if (Math.random() < .52) {
          startDesktopSleep(totoro, now);
        } else {
          totoro.state = "idle";
          totoro.nextStateAt = now + randomBetween(900, 2100);
        }
      }

      clampDesktop(totoro);
      return;
    }

    setVisualState(totoro, "");
    setFrame(totoro, totoro.direction, 0);

    if (now >= totoro.nextStateAt) {
      if (Math.random() < .48) {
        startDesktopSleep(totoro, now);
      } else {
        chooseDesktopTarget(totoro);
      }
    }
  }

  function avoidDesktopOverlap() {
    const dx = totoro.x - hamtaro.x;
    const dy = totoro.y - hamtaro.y;
    const d = Math.hypot(dx, dy);
    const minD = 42;

    if (d > 0 && d < minD) {
      const push = (minD - d) * .35;
      hamtaro.x -= (dx / d) * push;
      hamtaro.y -= (dy / d) * push;
      totoro.x += (dx / d) * push;
      totoro.y += (dy / d) * push;

      clampDesktop(hamtaro);
      clampDesktop(totoro);
    }
  }

  let last = performance.now();

  function desktopTick(now) {
    const dt = Math.min(.04, (now - last) / 1000);
    last = now;

    updateHamtaro(now, dt);
    updateTotoro(now, dt);
    avoidDesktopOverlap();

    pets.forEach(render);
    requestAnimationFrame(desktopTick);
  }

  window.addEventListener("resize", () => {
    pets.forEach(clampDesktop);
  }, { passive: true });

  pets.forEach(render);
  requestAnimationFrame(desktopTick);
})();
