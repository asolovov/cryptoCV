import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("OnchainCV unit tests", function () {

    async function deployCVFixture() {
        const [owner, address1, address2, address3] = await ethers.getSigners();

        const OnchainCV = await ethers.getContractFactory("OnchainCV");
        const cv = await OnchainCV.deploy();

        return {cv, owner, address1, address2, address3 };
    }

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            const {cv, owner} = await loadFixture(deployCVFixture);

            expect(await cv.owner()).to.equal(owner.address);
        });

        it("Should deploy with proper address", async function () {
            const {cv} = await loadFixture(deployCVFixture);

            expect(cv.address).to.be.properAddress;
        });

        it("Total likes should be 0", async function () {
            const {cv} = await loadFixture(deployCVFixture);

            expect(await cv.getTotalLikes()).to.equal(0);
        });
    });

    describe("Add main information", function () {
        it("Should add main information", async function () {
            const { cv } = await loadFixture(deployCVFixture);
            const mainInfo = {
                terms: {
                    schedule: "full day, freelance",
                    workFormat: "only remotely",
                },
                about: "Hello there! Here am I",
                contacts: {
                    email: "user@gmail.com",
                    tg: "/user",
                }
            }
            const mainInfoJSON = JSON.stringify(mainInfo)

            expect(await cv.getMainInfo()).to.equal("");

            await cv.updateMainInfo(mainInfoJSON);

            expect(await cv.getMainInfo()).to.equal(mainInfoJSON);
        });

        it("Should update main info", async function () {
            const { cv } = await loadFixture(deployCVFixture);
            const mainInfo = {
                terms: {
                    schedule: "full day, freelance",
                    workFormat: "only remotely",
                },
                about: "Hello there! Here am I",
                contacts: {
                    email: "user@gmail.com",
                    tg: "/user",
                }
            }
            const mainInfoJSON = JSON.stringify(mainInfo);
            let newMainInfo = mainInfo;
            newMainInfo.about = "Isn't it a crazy idea to make web3 CV?";
            const newMainInfoJSON = JSON.stringify(newMainInfo);

            await cv.updateMainInfo(mainInfoJSON);
            await cv.updateMainInfo(newMainInfoJSON);

            expect(await cv.getMainInfo()).to.equal(newMainInfoJSON);
        });


        it("Should not add terms id caller is not the owner", async function () {
            const { cv, address1 } = await loadFixture(deployCVFixture);
            const mainInfo = {
                terms: {
                    schedule: "full day, freelance",
                    workFormat: "only remotely",
                },
                about: "Hello there! Here am I",
                contacts: {
                    email: "user@gmail.com",
                    tg: "/user",
                }
            }
            const mainInfoJSON = JSON.stringify(mainInfo)

            const tx = cv.connect(address1).updateMainInfo(mainInfoJSON);

            await expect(tx).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("Cases and likes", function () {
        it("Should add case", async function () {
            const { cv } = await loadFixture(deployCVFixture);
            const info = {
                name: "CV",
                employee: "Uddug Team",
                description: "Make an on-chain CV",
                url: "https://github.com/asolovov/cryptoCV",
            }
            const infoJSON = JSON.stringify(info);
            const startDate = new Date('2023-01-20').valueOf() / 1000;
            const endDate = new Date('2023-01-23').valueOf() / 1000;

            await cv.addCase(infoJSON, startDate, endDate);

            const caseAdded = await cv.getCase(1);

            expect(caseAdded.id).to.equal(1);
            expect(caseAdded.info).to.equal(infoJSON);
            expect(caseAdded.startDate).to.equal(startDate);
            expect(caseAdded.endDate).to.equal(endDate);
            expect(caseAdded.likes).to.equal(0);
        });

        it("Should set likes", async function () {
            const { cv } = await loadFixture(deployCVFixture);
            const info = {
                name: "CV",
                employee: "Uddug Team",
                description: "Make an on-chain CV",
                url: "https://github.com/asolovov/cryptoCV",
            }
            const infoJSON = JSON.stringify(info);
            const startDate = new Date('2023-01-20').valueOf() / 1000;
            const endDate = new Date('2023-01-23').valueOf() / 1000;

            await cv.addCase(infoJSON, startDate, endDate);

            const caseAdded = await cv.getCase(1);
            expect(caseAdded.likes).to.equal(0);

            await cv.setLike(1);

            const caseWithLikes = await cv.getCase(1);
            expect(caseWithLikes.likes).to.equal(1);
        });

        it("Should increase total likes", async function () {
            const { cv } = await loadFixture(deployCVFixture);
            const info = {
                name: "CV",
                employee: "Uddug Team",
                description: "Make an on-chain CV",
                url: "https://github.com/asolovov/cryptoCV",
            }
            const infoJSON = JSON.stringify(info);
            const startDate = new Date('2023-01-20').valueOf() / 1000;
            const endDate = new Date('2023-01-23').valueOf() / 1000;

            await cv.addCase(infoJSON, startDate, endDate);

            expect(await cv.getTotalLikes()).to.equal(0);

            await cv.setLike(1);

            const totalLikes = await cv.getTotalLikes();
            expect(totalLikes).to.equal(1);
        });

        it("Should emit event", async function () {
            const { cv, owner } = await loadFixture(deployCVFixture);
            const info = {
                name: "CV",
                employee: "Uddug Team",
                description: "Make an on-chain CV",
                url: "https://github.com/asolovov/cryptoCV",
            }
            const infoJSON = JSON.stringify(info);
            const startDate = new Date('2023-01-20').valueOf() / 1000;
            const endDate = new Date('2023-01-23').valueOf() / 1000;

            await cv.addCase(infoJSON, startDate, endDate);

            const tx = cv.setLike(1);

            await expect(tx).to.emit(cv, "LikeSet").withArgs(1, owner.address);
        });

        it("Should update case and save likes", async function () {
            const { cv } = await loadFixture(deployCVFixture);
            const info = {
                name: "CV",
                employee: "Uddug Team",
                description: "Make an on-chain CV",
                url: "https://github.com/asolovov/cryptoCV",
            }
            const infoJSON = JSON.stringify(info);
            const startDate = new Date('2023-01-20').valueOf() / 1000;
            const endDate = new Date('2023-01-23').valueOf() / 1000;

            await cv.addCase(infoJSON, startDate, endDate);
            await cv.setLike(1);

            let newInfo = info;
            newInfo.name = "On-chain CV";
            const newInfoJSON = JSON.stringify(newInfo);

            await cv.updateCase(1, newInfoJSON, startDate, endDate);

            const caseAdded = await cv.getCase(1);

            expect(caseAdded.id).to.equal(1);
            expect(caseAdded.info).to.equal(newInfoJSON);
            expect(caseAdded.startDate).to.equal(startDate);
            expect(caseAdded.endDate).to.equal(endDate);
            expect(caseAdded.likes).to.equal(1);
        });

        it("Should remove case", async function () {
            const { cv } = await loadFixture(deployCVFixture);
            const info = {
                name: "CV",
                employee: "Uddug Team",
                description: "Make an on-chain CV",
                url: "https://github.com/asolovov/cryptoCV",
            }
            const infoJSON = JSON.stringify(info);
            const startDate = new Date('2023-01-20').valueOf() / 1000;
            const endDate = new Date('2023-01-23').valueOf() / 1000;

            await cv.addCase(infoJSON, startDate, endDate);
            await cv.removeCase(1);

            const tx = cv.getCase(1);

            await expect(tx).to.be.revertedWith("OnchainCV: case deleted or invalid ID");
        });

        it("Should remove case and decrease total likes", async function () {
            const { cv } = await loadFixture(deployCVFixture);
            const info = {
                name: "CV",
                employee: "Uddug Team",
                description: "Make an on-chain CV",
                url: "https://github.com/asolovov/cryptoCV",
            }
            const infoJSON = JSON.stringify(info);
            const startDate = new Date('2023-01-20').valueOf() / 1000;
            const endDate = new Date('2023-01-23').valueOf() / 1000;

            await cv.addCase(infoJSON, startDate, endDate);
            await cv.setLike(1);
            await cv.removeCase(1);

            expect(await cv.getTotalLikes()).to.equal(0);
        });

        it("Should get cases", async function () {
            const { cv } = await loadFixture(deployCVFixture);
            const info1 = {
                name: "case1",
            }
            const infoJSON1 = JSON.stringify(info1);
            const startDate1 = new Date('2023-01-20').valueOf() / 1000;

            const info2 = {
                name: "case2",
            }
            const infoJSON2 = JSON.stringify(info2);
            const startDate2 = new Date('2023-02-20').valueOf() / 1000;

            const info3 = {
                name: "case3",
            }
            const infoJSON3 = JSON.stringify(info3);
            const startDate3 = new Date('2023-03-20').valueOf() / 1000;

            await cv.addCase(infoJSON1, startDate1, 0);
            await cv.addCase(infoJSON2, startDate2, 0);
            await cv.addCase(infoJSON3, startDate3, 0);

            await cv.removeCase(2);

            const cases = await cv.getCases();

            expect(cases.length).to.equal(2);
            expect(cases[0].startDate).to.equal(startDate1);
            expect(cases[1].startDate).to.equal(startDate3);
            expect(await cv.getTotalCases()).to.equal(2);
        });

        it("Should not add case if start date is 0", async function () {
            const { cv } = await loadFixture(deployCVFixture);
            const info = {
                name: "CV",
                employee: "Uddug Team",
                description: "Make an on-chain CV",
                url: "https://github.com/asolovov/cryptoCV",
            }
            const infoJSON = JSON.stringify(info);
            const startDate = 0;
            const endDate = new Date('2023-01-23').valueOf() / 1000;

            const tx = cv.addCase(infoJSON, startDate, endDate);

            await expect(tx).to.be.revertedWith("OnchainCV: start date can not be 0");
        });

        it("Should not add case if caller is not the owner", async function () {
            const { cv, address1 } = await loadFixture(deployCVFixture);
            const info = {
                name: "CV",
                employee: "Uddug Team",
                description: "Make an on-chain CV",
                url: "https://github.com/asolovov/cryptoCV",
            }
            const infoJSON = JSON.stringify(info);
            const startDate = new Date('2023-01-20').valueOf() / 1000;
            const endDate = new Date('2023-01-23').valueOf() / 1000;

            const tx = cv.connect(address1).addCase(infoJSON, startDate, endDate);

            await expect(tx).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Should not update case if start date is 0", async function () {
            const { cv } = await loadFixture(deployCVFixture);
            const info = {
                name: "CV",
                employee: "Uddug Team",
                description: "Make an on-chain CV",
                url: "https://github.com/asolovov/cryptoCV",
            }
            const infoJSON = JSON.stringify(info);
            const startDate = new Date('2023-01-20').valueOf() / 1000;
            const endDate = new Date('2023-01-23').valueOf() / 1000;

            await cv.addCase(infoJSON, startDate, endDate);

            const tx = cv.updateCase(1, infoJSON, 0, endDate);

            await expect(tx).to.be.revertedWith("OnchainCV: start date can not be 0");
        });

        it("Should not update deleted case", async function () {
            const { cv } = await loadFixture(deployCVFixture);
            const info = {
                name: "CV",
                employee: "Uddug Team",
                description: "Make an on-chain CV",
                url: "https://github.com/asolovov/cryptoCV",
            }
            const infoJSON = JSON.stringify(info);
            const startDate = new Date('2023-01-20').valueOf() / 1000;
            const endDate = new Date('2023-01-23').valueOf() / 1000;

            await cv.addCase(infoJSON, startDate, endDate);
            await cv.removeCase(1);

            const tx = cv.updateCase(1, infoJSON, startDate, endDate);

            await expect(tx).to.be.revertedWith("OnchainCV: case deleted or invalid ID");
        });

        it("Should not update with invalid case id", async function () {
            const { cv } = await loadFixture(deployCVFixture);
            const info = {
                name: "CV",
                employee: "Uddug Team",
                description: "Make an on-chain CV",
                url: "https://github.com/asolovov/cryptoCV",
            }
            const infoJSON = JSON.stringify(info);
            const startDate = new Date('2023-01-20').valueOf() / 1000;
            const endDate = new Date('2023-01-23').valueOf() / 1000;

            const tx = cv.updateCase(1, infoJSON, startDate, endDate);

            await expect(tx).to.be.revertedWith("OnchainCV: case deleted or invalid ID");
        });

        it("Should not update case if caller is not the owner", async function () {
            const { cv, address1 } = await loadFixture(deployCVFixture);
            const info = {
                name: "CV",
                employee: "Uddug Team",
                description: "Make an on-chain CV",
                url: "https://github.com/asolovov/cryptoCV",
            }
            const infoJSON = JSON.stringify(info);
            const startDate = new Date('2023-01-20').valueOf() / 1000;
            const endDate = new Date('2023-01-23').valueOf() / 1000;

            await cv.addCase(infoJSON, startDate, endDate);

            const tx = cv.connect(address1).updateCase(1, infoJSON, startDate, endDate);

            await expect(tx).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Should not remove case if invalid case id", async function () {
            const { cv } = await loadFixture(deployCVFixture);
            const info = {
                name: "CV",
                employee: "Uddug Team",
                description: "Make an on-chain CV",
                url: "https://github.com/asolovov/cryptoCV",
            }
            const infoJSON = JSON.stringify(info);
            const startDate = new Date('2023-01-20').valueOf() / 1000;
            const endDate = new Date('2023-01-23').valueOf() / 1000;

            await cv.addCase(infoJSON, startDate, endDate);

            const tx = cv.removeCase(2);

            await expect(tx).to.be.revertedWith("OnchainCV: case deleted or invalid ID");
        });

        it("Should not remove case caller is not the owner", async function () {
            const { cv, address1 } = await loadFixture(deployCVFixture);
            const info = {
                name: "CV",
                employee: "Uddug Team",
                description: "Make an on-chain CV",
                url: "https://github.com/asolovov/cryptoCV",
            }
            const infoJSON = JSON.stringify(info);
            const startDate = new Date('2023-01-20').valueOf() / 1000;
            const endDate = new Date('2023-01-23').valueOf() / 1000;

            await cv.addCase(infoJSON, startDate, endDate);

            const tx = cv.connect(address1).removeCase(1);

            await expect(tx).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Should not set like if already did", async function () {
            const { cv, address1 } = await loadFixture(deployCVFixture);
            const info = {
                name: "CV",
                employee: "Uddug Team",
                description: "Make an on-chain CV",
                url: "https://github.com/asolovov/cryptoCV",
            }
            const infoJSON = JSON.stringify(info);
            const startDate = new Date('2023-01-20').valueOf() / 1000;
            const endDate = new Date('2023-01-23').valueOf() / 1000;

            await cv.addCase(infoJSON, startDate, endDate);
            await cv.setLike(1);
            await cv.connect(address1).setLike(1);

            const tx = cv.connect(address1).setLike(1);

            await expect(tx).to.be.revertedWith("OnchainCV: you already set like on this case");
        });

        it("Should not set like for invalid case ID", async function () {
            const { cv, address1 } = await loadFixture(deployCVFixture);
            const info = {
                name: "CV",
                employee: "Uddug Team",
                description: "Make an on-chain CV",
                url: "https://github.com/asolovov/cryptoCV",
            }
            const infoJSON = JSON.stringify(info);
            const startDate = new Date('2023-01-20').valueOf() / 1000;
            const endDate = new Date('2023-01-23').valueOf() / 1000;

            await cv.addCase(infoJSON, startDate, endDate);
            await cv.setLike(1);
            await cv.connect(address1).setLike(1);

            const tx = cv.connect(address1).setLike(2);

            await expect(tx).to.be.revertedWith("OnchainCV: case deleted or invalid ID");
        });
    });
})