
import { MockProvider } from "@ethereum-waffle/provider";
import { ecsign } from 'ethereumjs-util';
import { constants, Signer, utils } from "ethers";
import { ethers, upgrades } from "hardhat";
import { RandomToken, RandomToken__factory } from "../types";
import { expect } from "../utils/expects";
import { decodeEvents, filterEvents } from '../utils/events';
const {
  keccak256,
  defaultAbiCoder,
  hexlify,
  toUtf8Bytes,
  solidityKeccak256
} = utils;


describe("Random Token", function() {
  let accounts: Signer[];
  let RandomToken: RandomToken;

  const provider = new MockProvider()
  const [wallet, other] = provider.getWallets()

  this.beforeAll(async function () {
    const RandomTokenFactory = (await ethers.getContractFactory("RandomToken")) as RandomToken__factory;
    RandomToken = await upgrades.deployProxy(RandomTokenFactory, [100000000000], {
      initializer: "initializeToken",
    }) as RandomToken;
    
    await RandomToken.deployed();
  })

  beforeEach(async function () {
    accounts = await ethers.getSigners();
  });

  afterEach(async function () {
    RandomToken = RandomToken.connect(accounts[0])
  })

  it("Should create and mint total supply", async function() {
    expect(await RandomToken.totalSupply()).to.equal(100000000000);
  });

  it("Should create snapshot", async function () {
    const snapshot = await RandomToken.createSnapshot();
    
    const snapshotSuccess = await snapshot.wait()
    
    const events = filterEvents(snapshotSuccess, "Snapshot");

    expect(events.length).to.equal(1);

    const decodedEvents = decodeEvents(RandomToken, events);

    const snapshotTotal = await RandomToken.totalSupplyAt(decodedEvents[0].id);
    
    expect(snapshotTotal).to.equal(100000000000);
  });
  
  it("Should have different snapshots when taken twice", async function () {
    await RandomToken.mint(await accounts[0].getAddress(), 1)

    const snapshot = await RandomToken.createSnapshot();
    
    const snapshotSuccess = await snapshot.wait()
    
    const events = filterEvents(snapshotSuccess, "Snapshot");

    expect(events.length).to.equal(1);

    const decodedEvents = decodeEvents(RandomToken, events);

    const snapshotTotal = await RandomToken.totalSupplyAt(decodedEvents[0].id);
    
    expect(snapshotTotal).to.equal(100000000001);
  });

  it("Should not create snapshot when sender lacks admin role", async function () {
    const unauthorizedRandomToken = RandomToken.connect(accounts[1])
    expect(unauthorizedRandomToken.createSnapshot()).to.be.revertedWith('must have admin role to snapshot');
  });

  it("Should add allowance via permit", async function () {
    const TEST_AMOUNT = 500;
    
    await RandomToken.mint(wallet.address, 500)
    
    expect(await RandomToken.nonces(wallet.address)).to.eq((0))
    
    const nonce = await RandomToken.nonces(wallet.address)
    
    const deadline = constants.MaxUint256
    
    const digest = await getApprovalDigest(
      RandomToken,
      { owner: wallet.address, spender: other.address, value: TEST_AMOUNT },
      nonce,
      deadline
    )
    
    const { v, r, s } = ecsign(Buffer.from(digest.slice(2), 'hex'), Buffer.from(wallet.privateKey.slice(2), 'hex'))

    await expect(RandomToken.permit(wallet.address, other.address, TEST_AMOUNT, deadline, v, hexlify(r), hexlify(s)))
      .to.emit(RandomToken, 'Approval')
      .withArgs(wallet.address, other.address, TEST_AMOUNT)
    expect(await RandomToken.allowance(wallet.address, other.address)).to.eq(TEST_AMOUNT)
    expect(await RandomToken.nonces(wallet.address)).to.eq((1))
  });
  
});

const PERMIT_TYPEHASH = keccak256(
  toUtf8Bytes('Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)')
)
async function getDomainSeparator(name: string, tokenAddress: string) {
  return keccak256(
    defaultAbiCoder.encode(
      ['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
      [
        keccak256(toUtf8Bytes("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)")),
        keccak256(toUtf8Bytes(name)),
        keccak256(toUtf8Bytes('1')),
        (await ethers.provider.getNetwork()).chainId,
        tokenAddress
      ]
    )
  )
}
export async function getApprovalDigest(
  token: RandomToken,
  approve: {
    owner: string
    spender: string
    value: any
  },
  nonce: any,
  deadline: any
): Promise<string> {
  const name = await token.name()
  const DOMAIN_SEPARATOR = await getDomainSeparator(name, token.address)
  return solidityKeccak256(
      ['bytes1', 'bytes1', 'bytes32', 'bytes32'],
      [
        '0x19',
        '0x01',
        DOMAIN_SEPARATOR,
        keccak256(
          defaultAbiCoder.encode(
            ['bytes32', 'address', 'address', 'uint256', 'uint256', 'uint256'],
            [PERMIT_TYPEHASH, approve.owner, approve.spender, approve.value, nonce, deadline]
          )
        )
      ]
  )
}