const { anyValue } = require('@nomicfoundation/hardhat-chai-matchers/withArgs');
const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('TracemarkRegistry', function () {
  it('anchors a non-empty digest once', async function () {
    const registry = await ethers.deployContract('TracemarkRegistry');
    const digest = ethers.id('tracemark test event');

    await expect(registry.anchor(digest))
      .to.emit(registry, 'ReceiptAnchored')
      .withArgs(digest, await (await ethers.getSigners())[0].getAddress(), anyValue);

    expect(await registry.anchoredAt(digest)).to.be.gt(0);
    await expect(registry.anchor(digest)).to.be.revertedWith('digest already anchored');
  });

  it('rejects an empty digest', async function () {
    const registry = await ethers.deployContract('TracemarkRegistry');
    await expect(registry.anchor(ethers.ZeroHash)).to.be.revertedWith('empty digest');
  });
});
