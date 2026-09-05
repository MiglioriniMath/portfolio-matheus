
(() => {
  const layer = document.getElementById("pet-layer");
  if (!layer || window.matchMedia("(max-width: 700px)").matches) return;

  const shell = document.querySelector(".shell");
  const footer = document.querySelector(".footer");
  const rules = [...document.querySelectorAll(".rule")];
  const lowerRule = rules[rules.length - 1];

  if (!shell || !footer || !lowerRule) return;

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

  function getBounds() {
    const shellRect = shell.getBoundingClientRect();
    const lineRect = lowerRule.getBoundingClientRect();
    const footerRect = footer.getBoundingClientRect();

    const left = Math.max(22, shellRect.left - 8);
    const right = Math.min(window.innerWidth - 22, shellRect.right + 8);
    let top = lineRect.bottom + 24;
    let bottom = footerRect.top - 22;

    // Fallback for shorter desktop windows.
    if (bottom - top < 120) {
      top = Math.max(lineRect.bottom + 12, window.innerHeight * 0.60);
      bottom = window.innerHeight - 78;
    }

    return { left, right, top, bottom };
  }

  const directionRow = {
    down: 0,
    left: 1,
    right: 2,
    up: 3,
  };

  function setSpriteFrame(pet, direction, column) {
    const row = directionRow[direction];
    const x = column * 33.333333;
    const y = row * 33.333333;
    pet.el.style.backgroundPosition = `${x}% ${y}%`;
  }

  function randomBetween(min, max) {
    return min + Math.random() * Math.max(0, max - min);
  }

  function pickTarget(pet) {
    const b = getBounds();
    const pad = pet.size * 0.48;

    pet.targetX = randomBetween(b.left + pad, b.right - pad);
    pet.targetY = randomBetween(b.top + pad, b.bottom - pad);
    pet.state = "wander";
  }

  function makePet(options) {
    const el = document.createElement("div");
    el.className = `pixel-pet ${options.className}`;
    layer.appendChild(el);

    const b = getBounds();
    const pet = {
      el,
      name: options.name,
      size: options.size,
      x: randomBetween(b.left + 60, b.right - 60),
      y: randomBetween(b.top + 45, Math.max(b.top + 46, b.bottom - 45)),
      targetX: 0,
      targetY: 0,
      state: "idle",
      direction: options.startDirection,
      idleUntil: performance.now() + randomBetween(500, 1400),
      wanderSpeed: options.wanderSpeed,
      chaseSpeed: options.chaseSpeed,
      chaseRadius: options.chaseRadius,
      releaseRadius: options.releaseRadius,
      curiosity: options.curiosity,
      nextAnim: 0,
      walkFrame: 1,
    };

    setSpriteFrame(pet, pet.direction, 0);
    return pet;
  }

  const pets = [
    makePet({
      name: "Hamtaro",
      className: "hamtaro",
      size: 84,
      startDirection: "right",
      wanderSpeed: 24,
      chaseSpeed: 92,
      chaseRadius: 185,
      releaseRadius: 245,
      curiosity: 1.0,
    }),
    makePet({
      name: "Totoro",
      className: "totoro",
      size: 92,
      startDirection: "left",
      wanderSpeed: 18,
      chaseSpeed: 76,
      chaseRadius: 155,
      releaseRadius: 220,
      curiosity: 0.82,
    }),
  ];

  // Start them on different sides of the playground.
  {
    const b = getBounds();
    pets[0].x = b.left + (b.right - b.left) * 0.26;
    pets[1].x = b.left + (b.right - b.left) * 0.74;
    pets[0].y = b.top + (b.bottom - b.top) * 0.52;
    pets[1].y = b.top + (b.bottom - b.top) * 0.64;
  }

  function clampPet(pet) {
    const b = getBounds();
    const pad = pet.size * 0.44;
    pet.x = Math.max(b.left + pad, Math.min(b.right - pad, pet.x));
    pet.y = Math.max(b.top + pad, Math.min(b.bottom - pad, pet.y));
  }

  function directionFromVector(dx, dy) {
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx >= 0 ? "right" : "left";
    }
    return dy >= 0 ? "down" : "up";
  }

  function moveToward(pet, tx, ty, speed, dt) {
    const dx = tx - pet.x;
    const dy = ty - pet.y;
    const distance = Math.hypot(dx, dy);

    if (distance < 0.01) return distance;

    pet.direction = directionFromVector(dx, dy);
    const step = Math.min(distance, speed * dt);
    pet.x += (dx / distance) * step;
    pet.y += (dy / distance) * step;
    return distance;
  }

  function avoidPetOverlap() {
    const [a, b] = pets;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const d = Math.hypot(dx, dy);
    const minD = 62;

    if (d > 0 && d < minD) {
      const push = (minD - d) * 0.035;
      a.x -= (dx / d) * push;
      a.y -= (dy / d) * push;
      b.x += (dx / d) * push;
      b.y += (dy / d) * push;
    }
  }

  let last = performance.now();

  function tick(now) {
    const dt = Math.min(0.04, (now - last) / 1000);
    last = now;

    for (const pet of pets) {
      const mouseDistance = mouse.active
        ? Math.hypot(mouse.x - pet.x, mouse.y - pet.y)
        : Infinity;

      const canChase =
        mouse.active &&
        now - mouse.lastMove < 2200 &&
        (
          mouseDistance < pet.chaseRadius ||
          (pet.state === "chase" && mouseDistance < pet.releaseRadius)
        );

      if (canChase && Math.random() <= pet.curiosity) {
        pet.state = "chase";
      } else if (pet.state === "chase") {
        pet.state = "idle";
        pet.idleUntil = now + randomBetween(350, 950);
      }

      if (pet.state === "chase") {
        const distance = moveToward(pet, mouse.x, mouse.y, pet.chaseSpeed, dt);
        pet.el.classList.add("is-running");

        if (now >= pet.nextAnim) {
          // Alternate walk/run frames for a lively chase.
          pet.walkFrame = pet.walkFrame === 3 ? 2 : 3;
          setSpriteFrame(pet, pet.direction, pet.walkFrame);
          pet.nextAnim = now + 120;
        }

        if (distance < 20) {
          setSpriteFrame(pet, pet.direction, 0);
        }
      } else {
        pet.el.classList.remove("is-running");

        if (pet.state === "idle") {
          setSpriteFrame(pet, pet.direction, 0);

          if (now >= pet.idleUntil) {
            pickTarget(pet);
          }
        }

        if (pet.state === "wander") {
          const distance = moveToward(
            pet,
            pet.targetX,
            pet.targetY,
            pet.wanderSpeed,
            dt
          );

          if (now >= pet.nextAnim) {
            pet.walkFrame = pet.walkFrame === 1 ? 2 : 1;
            setSpriteFrame(pet, pet.direction, pet.walkFrame);
            pet.nextAnim = now + 230;
          }

          if (distance < 5) {
            pet.state = "idle";
            pet.idleUntil = now + randomBetween(650, 1900);
            setSpriteFrame(pet, pet.direction, 0);
          }
        }
      }

      clampPet(pet);
    }

    avoidPetOverlap();

    for (const pet of pets) {
      pet.el.style.left = `${pet.x}px`;
      pet.el.style.top = `${pet.y}px`;
    }

    requestAnimationFrame(tick);
  }

  window.addEventListener("resize", () => {
    for (const pet of pets) clampPet(pet);
  }, { passive: true });

  requestAnimationFrame(tick);
})();
