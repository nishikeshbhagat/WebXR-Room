import {
  AssetManifest,
  AssetType,
  Mesh,
  MeshStandardMaterial,
  MeshBasicMaterial,
  PlaneGeometry,
  BoxGeometry,
  CylinderGeometry,
  SphereGeometry,
  SessionMode,
  SRGBColorSpace,
  AssetManager,
  World,
  IBLTexture,
  DomeGradient,
  LocomotionEnvironment,
  EnvironmentType,
  Interactable,
  OneHandGrabbable,
  DistanceGrabbable,
} from "@iwsdk/core";

const assets: AssetManifest = {
  chair: { // glb of chair
    url: "/gltf/chair/chair.glb",
    type: AssetType.GLTF,
    priority: "critical",
  },
  wood: {   // texture added for table
    url: "/textures/wood.jpg",
    type: AssetType.Texture,
    priority: "critical",
  },
  painting: {
    url: "/textures/painting.jpg",
    type: AssetType.Texture,
    priority: "critical",
  },
  developer: {
    url: "/textures/developer.png",
    type: AssetType.Texture,
    priority: "critical",
  },
};

World.create(document.getElementById("scene-container") as HTMLDivElement, {
  assets,
  xr: {
    sessionMode: SessionMode.ImmersiveVR,
    offer: "always",
    features: { handTracking: true, layers: true },
  },
  features: {
    locomotion: { useWorker: true },
    grabbing: true,
    physics: true,
    sceneUnderstanding: false,
    environmentRaycast: false,
  },
}).then((world) => {
  const { camera } = world;

  const woodTexture = AssetManager.getTexture("wood")!;
  woodTexture.colorSpace = SRGBColorSpace;
  

  // Camera starting position
  camera.position.set(0, 1.6, 4);

  // ===== LIGHTING =====
  const levelRoot = world.activeLevel.value;
  levelRoot.addComponent(IBLTexture, {
    src: "room",
    intensity: 1.2,
  });

  // ===== BACKGROUND SKY =====
  levelRoot.addComponent(DomeGradient, {
    sky: [0.53, 0.81, 0.92, 1.0],
    equator: [0.91, 0.76, 0.65, 1.0],
    ground: [0.2, 0.2, 0.2, 1.0],
    intensity: 1.0,
  });

  // ===== FLOOR =====
  const floorMesh = new Mesh(
    new PlaneGeometry(10, 10),
    new MeshStandardMaterial({
      color: 0x2A2A2A,
      roughness: 0.8,
      metalness: 0.1,
    }),
  );
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.position.set(0, 0, 0);
  world
    .createTransformEntity(floorMesh)
    .addComponent(LocomotionEnvironment, {
      type: EnvironmentType.STATIC,
    });

  // ===== CEILING =====
  const ceilingMesh = new Mesh(
    new PlaneGeometry(10, 10),
    new MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
    }),
  );
  ceilingMesh.rotation.x = Math.PI / 2;
  ceilingMesh.position.set(0, 3, 0);
  world.createTransformEntity(ceilingMesh);

  // ===== BACK WALL =====
  const backWall = new Mesh(
    new PlaneGeometry(10, 3),
    new MeshStandardMaterial({
      color: 0xEAEAEA,
      roughness: 0.9,
    }),
  );
  backWall.position.set(0, 1.5, -5);
  world.createTransformEntity(backWall)
   .addComponent(LocomotionEnvironment, {
      type: EnvironmentType.STATIC,
    });

  // ===== FRONT WALL =====
  const frontWall = new Mesh(
    new PlaneGeometry(10, 3),
    new MeshStandardMaterial({
      color: 0xEAEAEA,
      roughness: 0.9,
    }),
  );
  frontWall.position.set(0, 1.5, 5);
  frontWall.rotateY(Math.PI);
  world.createTransformEntity(frontWall)
   .addComponent(LocomotionEnvironment, {
      type: EnvironmentType.STATIC,
    });


  // ===== LEFT WALL =====
  const leftWall = new Mesh(
    new PlaneGeometry(10, 3),
    new MeshStandardMaterial({
      color: 0xEAEAEA,
      roughness: 0.9,
    }),
  );
  leftWall.position.set(-5, 1.5, 0);
  leftWall.rotateY(Math.PI / 2);
  world.createTransformEntity(leftWall)
   .addComponent(LocomotionEnvironment, {
      type: EnvironmentType.STATIC,
    });


  // ===== RIGHT WALL =====
  const rightWall = new Mesh(
    new PlaneGeometry(10, 3),
    new MeshStandardMaterial({
      color: 0xEAEAEA,
      roughness: 0.9,
    }),
  );
  rightWall.position.set(5, 1.5, 0);
  rightWall.rotateY(-Math.PI / 2);
  world.createTransformEntity(rightWall)
   .addComponent(LocomotionEnvironment, {
      type: EnvironmentType.STATIC,
    });


  // ===== TABLE =====
  const tableTop = new Mesh(
    new BoxGeometry(2, 0.1, 1),
    new MeshStandardMaterial({
      map: woodTexture,
      roughness: 0.5,
      metalness: 0.1,
    }),
  );
  tableTop.position.set(0, 0.9, -2);
  world.createTransformEntity(tableTop)
   .addComponent(LocomotionEnvironment, {
      type: EnvironmentType.STATIC,
    });


  // Table legs
  const legPositions = [
    [-0.9, 0.45, -1.6],
    [0.9, 0.45, -1.6],
    [-0.9, 0.45, -2.4],
    [0.9, 0.45, -2.4],
  ];
  legPositions.forEach(([x, y, z]) => {
    const leg = new Mesh(
      new CylinderGeometry(0.05, 0.05, 0.9),
      new MeshStandardMaterial({ map: woodTexture, }),
    );
    leg.position.set(x, y, z);
    world.createTransformEntity(leg);
  });

  // ===== CHAIR =====
// ===== REAL CHAIR MODEL =====
const chairGLTF = AssetManager.getGLTF("chair");
  if (chairGLTF) {
    const chairModel = chairGLTF.scene;
    chairModel.position.set(-11.8, 0, 4.5);
    chairModel.scale.setScalar(0.035);
    world
      .createTransformEntity(chairModel)
      .addComponent(Interactable)
      .addComponent(OneHandGrabbable, {
        translate: true,
        rotate: true,
      });
  }

  // ===== PICTURE FRAME =====
  const frameBorder = new Mesh(
    new BoxGeometry(1.6, 1.1, 0.05),
    new MeshStandardMaterial({
      color: 0x8B6914,
      roughness: 0.5,
      metalness: 0.3,
    }),
  );
  frameBorder.position.set(0, 2, -4.9);
  world.createTransformEntity(frameBorder);

  // Actual painting
  const paintingTexture = AssetManager.getTexture("painting")!;
  paintingTexture.colorSpace = SRGBColorSpace;
  const painting = new Mesh(
    new PlaneGeometry(1.4, 0.9),
    new MeshBasicMaterial({
      map: paintingTexture,
    }),
  );
  painting.position.set(0, 2, -4.87);
  world.createTransformEntity(painting);

  // ===== GRABBABLE BALL ON TABLE =====
  const ball = new Mesh(
    new SphereGeometry(0.15, 32, 32),
    new MeshStandardMaterial({
      color: 0xff4444,
      roughness: 0.3,
      metalness: 0.5,
    }),
  );
  ball.position.set(-0.5, 1.1, -2);
  world
    .createTransformEntity(ball)
    .addComponent(Interactable)
    .addComponent(OneHandGrabbable, {
      translate: true,
      rotate: true,
    });

    // ===== DEVELOPER CREDIT =====
  // Frame
  const devFrame = new Mesh(
    new BoxGeometry(1.6, 0.6, 0.05),
    new MeshStandardMaterial({
      color: 0x1a1a2e,
      roughness: 0.3,
      metalness: 0.8,
    }),
  );
  devFrame.position.set(2, 2.3, -4.9);
  world.createTransformEntity(devFrame);

  // Developer image
  const devTexture = AssetManager.getTexture("developer")!;
  devTexture.colorSpace = SRGBColorSpace;
  const devPanel = new Mesh(
    new PlaneGeometry(1.4, 0.4),
    new MeshBasicMaterial({
      map: devTexture,
      transparent: true,
    }),
  );
  devPanel.position.set(2, 2.3, -4.87);
  world.createTransformEntity(devPanel);

  // ===== GRABBABLE BOX ON TABLE =====
  const box = new Mesh(
    new BoxGeometry(0.2, 0.2, 0.2),
    new MeshStandardMaterial({
      color: 0x44ff44,
      roughness: 0.5,
      metalness: 0.2,
    }),
  );
  box.position.set(0.5, 1.1, -2);
  world
    .createTransformEntity(box)
    .addComponent(Interactable)
    .addComponent(OneHandGrabbable, {
      translate: true,
      rotate: true,
    });

  // ===== LAMP =====
  const lampBase = new Mesh(
    new CylinderGeometry(0.1, 0.15, 0.1),
    new MeshStandardMaterial({
      color: 0x888888,
      metalness: 0.8,
    }),
  );
  lampBase.position.set(2, 0, -3);
  world.createTransformEntity(lampBase)
   .addComponent(LocomotionEnvironment, {
      type: EnvironmentType.STATIC,
    });


  const lampPole = new Mesh(
    new CylinderGeometry(0.03, 0.03, 1.5),
    new MeshStandardMaterial({
      color: 0x888888,
      metalness: 0.8,
    }),
  );
  lampPole.position.set(2, 0.8, -3);
  world.createTransformEntity(lampPole)
   .addComponent(LocomotionEnvironment, {
      type: EnvironmentType.STATIC,
    });


  const lampShade = new Mesh(
    new CylinderGeometry(0.3, 0.15, 0.4),
    new MeshStandardMaterial({
      color: 0xffffaa,
      roughness: 0.9,
    }),
  );
  lampShade.position.set(2, 1.7, -3);
  world.createTransformEntity(lampShade);

  // ===== PLANT POT =====
  const pot = new Mesh(
    new CylinderGeometry(0.15, 0.1, 0.3),
    new MeshStandardMaterial({
      color: 0x8b4513,
      roughness: 0.9,
    }),
  );
  pot.position.set(0.5, 1.05, -2);
  world.createTransformEntity(pot);

  const plant = new Mesh(
    new SphereGeometry(0.2, 16, 16),
    new MeshStandardMaterial({
      color: 0x228b22,
      roughness: 1.0,
    }),
  );
  plant.position.set(0.5, 1.35, -2);
  world.createTransformEntity(plant);

});