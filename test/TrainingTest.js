const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PersonalTraining", function () {
  let personalTraining;
  let owner, client1, client2;

  beforeEach(async function () {
    [owner, client1, client2] = await ethers.getSigners();
    const PersonalTraining = await ethers.getContractFactory("PersonalTraining");
    personalTraining = await PersonalTraining.deploy();
    await personalTraining.waitForDeployment();
  });

  it("Debería permitir al propietario agregar una sesión de entrenamiento", async function () {
    await personalTraining.addSession("Yoga", "url_imagen", ethers.parseEther("0.1"), 10);
    const sessions = await personalTraining.getSessions();
    expect(sessions.length).to.equal(1);
    expect(sessions[0].name).to.equal("Yoga");
  });

  it("Debería permitir reservar una sesión de entrenamiento", async function () {
    await personalTraining.addSession("Yoga", "url_imagen", ethers.parseEther("0.1"), 10);
    await personalTraining.connect(client1).bookSession(1, { value: ethers.parseEther("0.1") });
    const sessions = await personalTraining.getSessions();
    expect(sessions[0].slots).to.equal(9);
  });

  it("Solo el propietario debería poder agregar sesiones", async function () {
    await expect(
      personalTraining.connect(client1).addSession("Pilates", "url_imagen", ethers.parseEther("0.2"), 5)
    ).to.be.revertedWith("Only owner");
  });

  it("Debería fallar si se intenta reservar una sesión con fondos insuficientes", async function () {
    await personalTraining.addSession("Yoga", "url_imagen", ethers.parseEther("0.1"), 10);
    await expect(
      personalTraining.connect(client1).bookSession(1, { value: ethers.parseEther("0.05") })
    ).to.be.revertedWith("Not enough ETH sent");
  });

  it("Debería fallar si se intenta reservar una sesión sin cupos disponibles", async function () {
    await personalTraining.addSession("Yoga", "url_imagen", ethers.parseEther("0.1"), 1);
    await personalTraining.connect(client1).bookSession(1, { value: ethers.parseEther("0.1") });
    await expect(
      personalTraining.connect(client2).bookSession(1, { value: ethers.parseEther("0.1") })
    ).to.be.revertedWith("No slots available");
  });

  it("Debería devolver todas las sesiones correctamente", async function () {
    await personalTraining.addSession("Yoga", "url_imagen", ethers.parseEther("0.1"), 10);
    await personalTraining.addSession("Pilates", "url_imagen", ethers.parseEther("0.2"), 5);
    const sessions = await personalTraining.getSessions();
    expect(sessions.length).to.equal(2);
    expect(sessions[0].name).to.equal("Yoga");
    expect(sessions[1].name).to.equal("Pilates");
  });

  it("Debería permitir al propietario actualizar una sesión", async function () {
    await personalTraining.addSession("Yoga", "url_imagen", ethers.parseEther("0.1"), 10);
    await personalTraining.updateSession(1, "Yoga Avanzado", "url_actualizada", ethers.parseEther("0.2"), 15);
    const session = await personalTraining.getSession(1);
    expect(session.name).to.equal("Yoga Avanzado");
    expect(session.price).to.equal(ethers.parseEther("0.2"));
    expect(session.slots).to.equal(15);
  });

  it("Debería fallar si un cliente intenta actualizar una sesión", async function () {
    await personalTraining.addSession("Yoga", "url_imagen", ethers.parseEther("0.1"), 10);
    await expect(
      personalTraining.connect(client1).updateSession(1, "Yoga Avanzado", "url_actualizada", ethers.parseEther("0.2"), 15)
    ).to.be.revertedWith("Only owner");
  });

  it("Debería fallar si se intenta obtener una sesión con un ID inválido", async function () {
    await expect(personalTraining.getSession(999)).to.be.revertedWith("Invalid session ID");
  });
});