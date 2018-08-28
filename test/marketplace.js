pragma solidity ^0.4.17;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Marketplace.sol";

contract TestAdoption {
  Product product = Product(DeployedAddresses.Product());

  // Testing the addProductToStore function
  function testUserCanAddProduct() public {
    uint productIndex = product.productId(0);

    uint expected = 0;

    Assert.equal(productIndex, expected, "Should be equal");
  }

  // Testing retrieval of a single pet's owner
  function testGetAdopterAddressByPetId() public {
    // Expected owner is this contract
    address expected = this;

    address adopter = adoption.adopters(8);

    Assert.equal(adopter, expected, "Owner of pet ID 8 should be recorded.");
  }

  // Testing retrieval of all pet owner
  function testGetAdopterAddressByPetIdInArray() public {
    // Expected owner is this contract
    address expected = this;

    // Store adopters in memory rather than contract's storage
    address[16] memory adopters = adoption.getAdopters();

    Assert.equal(adopters[8], expected, "Owner of pet ID 8 should be recorded.");
  }

}
