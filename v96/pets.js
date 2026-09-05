
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

  function randomBetween(min, max) {
    return min + Math.random() * Math.max(0, max - min);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function boundsFor(pet) {
    const margin = 26;
    const half = pet.size * .5;
    return {
      left: margin + half,
      right: window.innerWidth - margin - half,
      top: 30 + half,
      bottom: window.innerHeight - 26 - half,
    };
  }

  const directionRow = { down: 0, left: 1, right: 2, up: 3 };

  function setFrame(pet, direction, column) {
    const row = directionRow[direction];
    const x = column * 33.333333;
    const y = row * 33.333333;
    pet.el.style.backgroundPosition = `${x}% ${y}%`;
  }

  function faceFromVector(dx, dy) {
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx >= 0 ? "right" : "left";
    }
    return dy >= 0 ? "down" : "up";
  }

  function clampIntoBounds(pet) {
    const b = boundsFor(pet);
    pet.x = clamp(pet.x, b.left, b.right);
    pet.y = clamp(pet.y, b.top, b.bottom);
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
      actionSpeed: options.actionSpeed,
      nextStateAt: performance.now() + randomBetween(450, 1100),
      nextAnimAt: 0,
      walkColumn: 1,
      partner: null,
      actionUntil: 0,
    };

    clampIntoBounds(pet);
    setFrame(pet, pet.direction, 0);
    return pet;
  }

  const hamtaro = createPet({
    name: "Hamtaro",
    className: "hamtaro",
    size: 58,
    startX: .24,
    startY: .68,
    direction: "right",
    wanderSpeed: 40,
    actionSpeed: 92,
  });

  const totoro = createPet({
    name: "Totoro",
    className: "totoro",
    size: 64,
    startX: .76,
    startY: .76,
    direction: "left",
    wanderSpeed: 18,
    actionSpeed: 80,
  });

  hamtaro.partner = totoro;
  totoro.partner = hamtaro;

  const pets = [hamtaro, totoro];

  function setVisualState(pet, name) {
    pet.el.classList.remove("is-walking", "is-running", "is-sleeping");
    if (name) pet.el.classList.add(name);
  }

  function chooseWanderTarget(pet) {
    const b = boundsFor(pet);
    pet.targetX = randomBetween(b.left, b.right);
    pet.targetY = randomBetween(b.top, b.bottom);
    pet.state = "wander";
    pet.nextAnimAt = 0;
  }

  function startSleep(pet, now) {
    pet.state = "sleep";
    pet.nextStateAt = now + (
      pet.name === "Totoro"
        ? randomBetween(4800, 9000)
        : randomBetween(1600, 3000)
    );
    setFrame(pet, pet.direction, 0);
    setVisualState(pet, "is-sleeping");
  }

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

    // Hamtaro é agitado e um pouco arisco: se a seta chega perto, ele dá uma escapada.
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

      clampIntoBounds(hamtaro);
      return;
    }

    // Às vezes Hamtaro resolve acompanhar o Totoro.
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

      clampIntoBounds(hamtaro);
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

      clampIntoBounds(hamtaro);
      return;
    }

    // Idle curto: Hamtaro dificilmente fica parado por muito tempo.
    setVisualState(hamtaro, "");
    setFrame(hamtaro, hamtaro.direction, 0);

    if (now >= hamtaro.nextStateAt) {
      const roll = Math.random();

      if (roll < .04) {
        startSleep(hamtaro, now);
      } else if (roll < .30) {
        startHamtaroFollow(now);
      } else {
        chooseWanderTarget(hamtaro);
      }
    }
  }

  function updateTotoro(now, dt) {
    const mouseRecent = mouse.active && now - mouse.lastMove < 1900;
    const mouseDistance = mouseRecent
      ? Math.hypot(mouse.x - totoro.x, mouse.y - totoro.y)
      : Infinity;

    // Totoro é mais sonolento, mas quando a seta chega perto ele SEMPRE acorda e vai atrás.
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

      clampIntoBounds(totoro);
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
          startSleep(totoro, now);
        } else {
          totoro.state = "idle";
          totoro.nextStateAt = now + randomBetween(900, 2100);
        }
      }

      clampIntoBounds(totoro);
      return;
    }

    // Totoro permanece parado por mais tempo e dorme com frequência.
    setVisualState(totoro, "");
    setFrame(totoro, totoro.direction, 0);

    if (now >= totoro.nextStateAt) {
      if (Math.random() < .48) {
        startSleep(totoro, now);
      } else {
        chooseWanderTarget(totoro);
      }
    }
  }

  function avoidOverlap() {
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

      clampIntoBounds(hamtaro);
      clampIntoBounds(totoro);
    }
  }

  function render(pet) {
    pet.el.style.left = `${pet.x}px`;
    pet.el.style.top = `${pet.y}px`;
  }

  let last = performance.now();

  function tick(now) {
    const dt = Math.min(.04, (now - last) / 1000);
    last = now;

    updateHamtaro(now, dt);
    updateTotoro(now, dt);
    avoidOverlap();

    pets.forEach(render);
    requestAnimationFrame(tick);
  }

  window.addEventListener("resize", () => {
    pets.forEach(clampIntoBounds);
  }, { passive: true });

  pets.forEach(render);
  requestAnimationFrame(tick);
})();
