(function () {
  const REGISTRY_PATH = '../patch_registry.json';
  const USER_STATE_PATH = '../user_state.json';

  let registry = [];
  let userState = { artifacts: [], nfts: [], flags: [], puzzles: [] };

  const scene = {
    init() {
      this.canvas = document.createElement('canvas');
      this.canvas.className = 'pmv-starfield';
      document.body.appendChild(this.canvas);
      this.ctx = this.canvas.getContext('2d');
      this.resize();
      window.addEventListener('resize', () => this.resize());
      this.stars = Array.from({ length: 220 }, (_, i) => ({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        z: Math.random() * 2 + 0.6,
        drift: (i % 5) * 0.1 + 0.15,
      }));
      requestAnimationFrame(() => this.draw());
    },
    resize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    },
    draw() {
      if (!this.ctx) return;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.stars.forEach((star) => {
        star.x -= star.drift;
        if (star.x < 0) star.x = this.canvas.width;
        const size = star.z * 1.2;
        this.ctx.fillStyle = `rgba(173, 223, 255, ${0.2 + star.z * 0.2})`;
        this.ctx.beginPath();
        this.ctx.arc(star.x, star.y, size, 0, Math.PI * 2);
        this.ctx.fill();
      });
      requestAnimationFrame(() => this.draw());
    },
  };

  const audio = {
    initialized: false,
    stubbed: true,
    init() {
      if (this.initialized) return;
      this.initialized = true;
      console.info('Audio hooks stubbed. Integrate runtime bus here.');
    },
    pulse() {
      // placeholder for subtle elevator/gateway cues
    },
  };

  function applyWowFirstVisuals() {
    document.body.classList.add('pmv-wow');
    scene.init();
    audio.init();
  }

  function accessStatus(entry) {
    const rules = entry.access_rules || {};
    const has = {
      artifact: (id) => userState.artifacts.includes(id),
      nft: (id) => userState.nfts.includes(id),
      flag: (id) => userState.flags.includes(id),
      puzzle: (id) => userState.puzzles.includes(id),
    };

    const soft = (rules.soft || []).some((rule) => !hasRule(rule));
    const hard = (rules.hard || []).some((rule) => !hasRule(rule));

    function hasRule(rule) {
      const [type, id] = rule.split(':');
      const checker = has[type];
      return checker ? checker(id) : false;
    }

    if (hard) return 'hard_locked';
    if (soft) return 'soft_locked';
    return 'unlocked';
  }

  function route() {
    const hash = window.location.hash || '#/lobby';
    const [, base, id] = hash.split('/');
    if (base === 'rooms' && id) renderRoom(decodeURIComponent(id));
    else if (base === 'elevator') renderElevator();
    else renderLobby();
  }

  function renderLobby() {
    const container = ensureRoot('Lobby: Multiverse Galaxy');
    container.innerHTML = '';
    const header = document.createElement('div');
    header.className = 'pmv-banner';
    header.innerHTML = '<h1>Portfolio Multiverse</h1><p>Every -3DT patch rendered as a star. Click to enter.</p>';
    container.appendChild(header);

    const galaxy = document.createElement('div');
    galaxy.className = 'pmv-galaxy';
    registry.forEach((entry, idx) => {
      const status = accessStatus(entry);
      if (status === 'hard_locked') {
        galaxy.appendChild(makeHiddenNode());
        return;
      }
      const node = document.createElement('button');
      node.className = `pmv-node pmv-${status}`;
      node.style.setProperty('--orbit', `${8 + idx * 1.1}rem`);
      node.style.setProperty('--tilt', `${(idx % 5) * 6}deg`);
      node.title = `${entry.display_name} (${entry.room_type})`;
      node.innerHTML = `<span>${entry.display_name}</span>`;
      node.onclick = () => navigateRoom(entry.patch_id);
      galaxy.appendChild(node);
    });
    container.appendChild(galaxy);
  }

  function makeHiddenNode() {
    const placeholder = document.createElement('div');
    placeholder.className = 'pmv-node pmv-hidden';
    placeholder.title = 'Hidden timeline';
    return placeholder;
  }

  function renderRoom(patchId) {
    const entry = registry.find((item) => item.patch_id === patchId);
    if (!entry) {
      window.location.hash = '#/lobby';
      return;
    }
    const status = accessStatus(entry);
    if (status === 'hard_locked') {
      window.location.hash = '#/lobby';
      return;
    }
    const container = ensureRoot(`${entry.display_name}`);
    container.innerHTML = '';
    const hero = document.createElement('div');
    hero.className = 'pmv-room';
    hero.dataset.profile = entry['3d_scene_profile']?.lighting || 'ambient';
    // v0.app-compatible mount target: inject engine canvas into `hero` when binding real renderers.

    const orbit = document.createElement('div');
    orbit.className = 'pmv-room-shell';
    orbit.innerHTML = `
      <div class="pmv-parallax">
        <div class="pmv-layer depth-1"></div>
        <div class="pmv-layer depth-2"></div>
        <div class="pmv-layer depth-3"></div>
      </div>
      <div class="pmv-room-meta">
        <p class="pmv-label">${entry.room_type.toUpperCase()} · Trinity ${entry.trinity_level}</p>
        <h1>${entry.display_name}</h1>
        <p>${entry.route_slug}</p>
        <p class="pmv-stub">STUB_RUNTIME · Wired Chaos executes · No renderer bound</p>
      </div>
    `;
    hero.appendChild(orbit);

    const controls = document.createElement('div');
    controls.className = 'pmv-controls';
    const back = document.createElement('button');
    back.textContent = '← Galaxy Lobby';
    back.onclick = () => (window.location.hash = '#/lobby');
    const elevator = document.createElement('button');
    elevator.textContent = 'Trinity Elevator';
    elevator.onclick = () => (window.location.hash = '#/elevator');
    controls.append(back, elevator);

    container.append(controls, hero);
    if (status === 'soft_locked') {
      const lock = document.createElement('div');
      lock.className = 'pmv-lock';
      lock.textContent = 'Visible but locked — meet soft conditions to enter fully.';
      container.appendChild(lock);
    }
  }

  function renderElevator() {
    const container = ensureRoot('Trinity Elevator');
    container.innerHTML = '';
    const header = document.createElement('div');
    header.className = 'pmv-banner';
    header.innerHTML = '<h1>Trinity Elevator</h1><p>Vertical timelines with horizontal room branches.</p>';
    container.appendChild(header);

    const levels = document.createElement('div');
    levels.className = 'pmv-elevator';

    const grouped = registry.reduce((acc, entry) => {
      acc[entry.trinity_level] = acc[entry.trinity_level] || [];
      acc[entry.trinity_level].push(entry);
      return acc;
    }, {});

    Object.keys(grouped)
      .map(Number)
      .sort((a, b) => a - b)
      .forEach((level) => {
        const column = document.createElement('div');
        column.className = 'pmv-level';
        column.innerHTML = `<div class="pmv-level-label">Level ${level}</div>`;
        grouped[level].forEach((entry) => {
          const status = accessStatus(entry);
          if (status === 'hard_locked') {
            const ghost = document.createElement('div');
            ghost.className = 'pmv-elevator-room pmv-hidden';
            ghost.textContent = 'Locked floor';
            column.appendChild(ghost);
            return;
          }
          const tile = document.createElement('button');
          tile.className = `pmv-elevator-room pmv-${status}`;
          tile.textContent = entry.display_name;
          tile.onclick = () => navigateRoom(entry.patch_id);
          column.appendChild(tile);
        });
        levels.appendChild(column);
      });

    container.appendChild(levels);
  }

  function ensureRoot(title) {
    let root = document.querySelector('#pmv-root');
    if (!root) {
      root = document.createElement('div');
      root.id = 'pmv-root';
      document.body.appendChild(root);
    }
    document.title = `Portfolio Multiverse · ${title}`;
    return root;
  }

  function navigateRoom(patchId) {
    window.location.hash = `#/rooms/${encodeURIComponent(patchId)}`;
  }

  function loadJSON(path) {
    return fetch(path).then((resp) => resp.json());
  }

  function bootstrap() {
    applyWowFirstVisuals();
    Promise.all([loadJSON(REGISTRY_PATH), loadJSON(USER_STATE_PATH)])
      .then(([loadedRegistry, loadedUser]) => {
        registry = loadedRegistry;
        userState = Object.assign(userState, loadedUser);
        route();
        window.addEventListener('hashchange', route);
      })
      .catch((err) => {
        console.error('Failed to load registry or user state', err);
      });
  }

  document.addEventListener('DOMContentLoaded', bootstrap);
})();
