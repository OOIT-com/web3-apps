pragma solidity 0.8;
// SPDX-License-Identifier: MIT

contract KeyBlock
{
    struct Item {
        string name;
        string value;
        string inserted;
    }

    mapping(address => Item[]) itemLists;
    mapping(address => string) keys;

    function add(string memory _name, string memory _value, string memory _inserted) public
    {
        Item[] storage itemList = itemLists[msg.sender];
        itemList.push(Item(_name, _value, _inserted));
    }

    function set(uint256 _index, string memory _name, string memory _value, string memory _inserted) public
    {
        require(_index < itemLists[msg.sender].length, "Index out of bounds");
        itemLists[msg.sender][_index] = Item(_name, _value, _inserted);
    }


    function get(uint256 _index) public view returns
    (
        string memory name,
        string memory value,
        string memory inserted
    )
    {
        require(_index < itemLists[msg.sender].length, "Index out of bounds");
        name = itemLists[msg.sender][_index].name;
        value = itemLists[msg.sender][_index].value;
        inserted = itemLists[msg.sender][_index].inserted;
        return (name, value, inserted);
    }


    function len() public view returns (uint)
    {
        return itemLists[msg.sender].length;
    }

}
