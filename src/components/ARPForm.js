import React, { Component } from "react";
import {
  Col,
  Form,
  Button,
  Card,
  OverlayTrigger,
  Tooltip,
  InputGroup,
  DropdownButton,
  Dropdown,
  Alert,
} from "react-bootstrap";
import { FaQuestion } from "react-icons/fa";
import DropdownItem from "react-bootstrap/DropdownItem";
import IPPrecedenceOptions from "./IPPrecedenceOptions";
import DSCPOptions from "./DSCPOptions";
import { Address6 } from "ip-address/ip-address";
import MY_GLOBAL from "./Globals";
import DisplayTriplets from "./DisplayTriplets";

export class ARPForm extends Component {
  constructor(props) {
    super(props);

    /*
     * Initialize all the state variables used in this component.
     */
    this.state = {
      arpSubmit: false,
      protocolType: "IPv4",           // length 16   hardcoded for IPv4 -> 0x0800
      hardwareType: "",               // length 16 
      hardwareAddressLength: 48,      // length 8    hardcoded for IPv4
      protocolAddressLength: 32,      // length 8    hardcoded for IPv4
      operation: "",                  // length 16   either 1 (for request) or 2 (for reply)
      
      senderHardwareAddress: "",      // length 48
      senderHardwareAddressMask: "",
      senderProtocolAddress: "",      // length 32
      senderProtocolAddressMask: "",
      targetHardwareAddress: "",      // length 48
      targetHardwareAddressMask: "",
      targetProtocolAddress: "",      // length 32
      targetProtocolAddressMask: "",
      tripletValue: "",               // total length 224 (28 bytes)

      hardwareTypeError: false,
      operationError: false,
      senderHardwareAddressError: false,
      senderProtocolAddressError: false,
      targetHardwareAddressError: false,
      targetProtocolAddressError: false,
      senderHardwareAddressMaskError: false,
      senderHardwareAddressMaskEmptyError: false,
      senderProtocolAddressMaskError: false,
      senderProtocolAddressMaskEmptyError: false,
      targetHardwareAddressMaskError: false,
      targetHardwareAddressEmptyError: false,
      targetProtocolAddressMaskError: false,
      targetProtocolAddressMaskEmptyError: false,
      emptyError: false
    };
    
    // this.validateProtocolType = this.validateProtocolType.bind(this);
    this.validateHardwareType = this.validateHardwareType.bind(this);
    this.validateOperation = this.validateOperation.bind(this);
    this.validateSenderHardwareAddress = this.validateSenderHardwareAddress.bind(this);
    this.validateSenderProtocolAddress = this.validateSenderProtocolAddress.bind(this);
    this.validateTargetHardwareAddress = this.validateTargetHardwareAddress.bind(this);
    this.validateTargetProtocolAddress = this.validateTargetProtocolAddress.bind(this);
    this.validateARPForm = this.validateARPForm.bind(this);
    this.handleARPSubmit = this.handleARPSubmit.bind(this);
    this.calculateARPTriplet = this.calculateARPTriplet.bind(this);
    this.handleTypeChange = this.handleTypeChange.bind(this);
    this.bitwiseAnd = this.bitwiseAnd.bind(this);

  }

  /*
   * Performs bitwise AND operation.
   * Input: a, b
   * Output: ans <- a & b
   */
  bitwiseAnd(a, b) {
    let ans = "";
    for (let i = 0; i < a.length; i++) {
      let temp = parseInt("0x" + a.charAt(i)) & parseInt("0x" + b.charAt(i));
      if (temp >= 0 && temp <= 9) ans += temp;
      else if (temp === 10) ans += "a";
      else if (temp === 11) ans += "b";
      else if (temp === 12) ans += "c";
      else if (temp === 13) ans += "d";
      else if (temp === 14) ans += "e";
      else ans += "f";
    }
    return ans;
  }

  handleChange = (event) => {
    const isCheckbox = event.target.type === "checkbox";
    this.setState({
      [event.target.name]: isCheckbox
        ? event.target.checked
        : event.target.value,
    });
  };

  handleTypeChange(eventKey, event) {
    let options = [
      "IPv4"
    ];
    this.setState({
      type: options[eventKey],
    });
  }

  validateHardwareType() {
    let val = parseInt(this.state.hardwareType);
    if (val >= 0 && val <= 65535) return true;
    this.setState(
      {
        hardwareTypeError: true,
      },
      () => {
        return false;
      }
    );
  }

  validateOperation() {
    let val = parseInt(this.state.operation);
    if (val >= 0 && val <= 65535) return true;
    this.setState(
      {
        operationError: true,
      },
      () => {
        return false;
      }
    );
  }

  validateSenderHardwareAddress() {
    let macAddress = this.state.senderHardwareAddress
    const regex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    if (regex.test(macAddress)) return true;
    this.setState(
      {
        senderHardwareAddressError: true,
      },
      () => {
        return false;
      }
    );
  }

  validateSenderHardwareAddressMask() {
    let macAddress = this.state.senderHardwareAddressMask
    const regex = /^([0F0f]{2}[:-]){5}([0F0f]{2})$/;
    if (regex.test(macAddress)) return true;
    this.setState(
      {
        senderHardwareAddressMaskError: true,
      },
      () => {
        return false;
      }
    );
  }

  validateTargetHardwareAddress() {
    let macAddress = this.state.targetHardwareAddress
    const regex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    if (regex.test(macAddress)) return true;
    this.setState(
      {
        targetHardwareAddressError: true,
      },
      () => {
        return false;
      }
    );
  }

  validateTargetHardwareAddressMask() {
    let macAddress = this.state.targetHardwareAddressMask
    const regex = /^([0F0f]{2}[:-]){5}([0F0f]{2})$/;
    if (regex.test(macAddress)) return true;
    this.setState(
      {
        TargetHardwareAddressMaskError: true,
      },
      () => {
        return false;
      }
    );
  }

  validateSenderProtocolAddress() {
    let regex = /^([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\.([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\.([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\.([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])$/;
    if (regex.test(this.state.senderProtocolAddress.replace(/^\s+|\s+$/g, ""))) {
      return true;
    }
    this.setState(
      {
        senderProtocolAddressError: true,
      },
      () => {
        return false;
      }
    );
  }

  validateSenderProtocolAddressMask() {
    let regex = /^([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\.([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\.([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\.([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])$/;
    if (regex.test(this.state.senderProtocolAddressMask.replace(/^\s+|\s+$/g, ""))) {
      return true;
    }
    this.setState(
      {
        senderProtocolAddressMaskError: true,
      },
      () => {
        return false;
      }
    );
  }

  validateTargetProtocolAddress() {
    let regex = /^([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\.([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\.([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\.([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])$/;
    if (regex.test(this.state.targetProtocolAddress.replace(/^\s+|\s+$/g, ""))) {
      return true;
    }
    this.setState(
      {
        targetProtocolAddressError: true,
      },
      () => {
        return false;
      }
    );
  }

  validateTargetProtocolAddressMask() {
    let regex = /^([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\.([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\.([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\.([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])$/;
    if (regex.test(this.state.targetProtocolAddressMask.replace(/^\s+|\s+$/g, ""))) {
      return true;
    }
    this.setState(
      {
        targetProtocolAddressMaskError: true,
      },
      () => {
        return false;
      }
    );
  }

  validateARPForm() {
    let flag = 0;
  
    // Check if all fields are empty
    if(this.state.hardwareType === "" && this.state.operation === "" && 
       this.state.senderHardwareAddress === "" && this.state.senderProtocolAddress === "" &&
       this.state.targetHardwareAddress === "" && this.state.targetProtocolAddress === "" &&
       this.state.senderHardwareAddressMask === "" && this.state.targetHardwareAddressMask === "" &&
       this.state.senderProtocolAddressMask === "" && this.state.targetProtocolAddressMask === "") {
      this.setState({ emptyError: true });
      return false;
    }
  
    // Validate each field and corresponding mask
    if(this.state.hardwareType !== ""){
      flag = 1;
      if(!this.validateHardwareType()) return false;
    }
  
    if(this.state.operation !== ""){
      flag = 1;
      if(!this.validateOperation()) return false;
    }
  
    // Check sender hardware address and mask
    if(this.state.senderHardwareAddress !== "" && this.state.senderHardwareAddressMask === "") {
      this.setState({ senderHardwareAddressMaskEmptyError: true });
      return false;
    }
    if(this.state.senderHardwareAddress !== "" && !this.validateSenderHardwareAddress() ||
       this.state.senderHardwareAddressMask !== "" && !this.validateSenderHardwareAddressMask()) {
      return false;
    }
    if(this.state.senderHardwareAddress !== "" || this.state.senderHardwareAddressMask !== "") {
      flag = 1;
    }
  
    // Check sender protocol address and mask
    if(this.state.senderProtocolAddress !== "" && this.state.senderProtocolAddressMask === "") {
      this.setState({ senderProtocolAddressMaskEmptyError: true });
      return false;
    }
    if(this.state.senderProtocolAddress !== "" && !this.validateSenderProtocolAddress() ||
       this.state.senderProtocolAddressMask !== "" && !this.validateSenderProtocolAddressMask()) {
      return false;
    }
    if(this.state.senderProtocolAddress !== "" || this.state.senderProtocolAddressMask !== "") {
      flag = 1;
    }
  
    // Check target hardware address and mask
    if(this.state.targetHardwareAddress !== "" && this.state.targetHardwareAddressMask === "") {
      this.setState({ targetHardwareAddressMaskEmptyError: true });
      return false;
    }
    if(this.state.targetHardwareAddress !== "" && !this.validateTargetHardwareAddress() ||
       this.state.targetHardwareAddressMask !== "" && !this.validateTargetHardwareAddressMask()) {
      return false;
    }
    if(this.state.targetHardwareAddress !== "" || this.state.targetHardwareAddressMask !== "") {
      flag = 1;
    }
  
    // Check target protocol address and mask
    if(this.state.targetProtocolAddress !== "" && this.state.targetProtocolAddressMask === "") {
      this.setState({ targetProtocolAddressMaskEmptyError: true });
      return false;
    }
    if(this.state.targetProtocolAddress !== "" && !this.validateTargetProtocolAddress() ||
       this.state.targetProtocolAddressMask !== "" && !this.validateTargetProtocolAddressMask()) {
      return false;
    }
    if(this.state.targetProtocolAddress !== "" || this.state.targetProtocolAddressMask !== "") {
      flag = 1;
    }
  
    if(flag === 1) return true;
    return false;
  }


  handleARPSubmit() {
    this.setState(
      {
        arpSubmit: false,
        emptyError: false,
        hardwareTypeError: false,
        operationError: false,
        senderHardwareAddressError: false,
        senderHardwareAddressMaskEmptyError: false,
        senderHardwareAddressMaskError: false,
        senderProtocolAddressError: false,
        senderProtocolAddressMaskEmptyError: false,
        senderProtocolAddressMaskError: false,
        targetHardwareAddressError: false,
        targetHardwareAddressMaskEmptyError: false,
        targetHardwareAddressMaskError: false,
        targetProtocolAddressError: false,
        targetProtocolAddressMaskEmptyError: false,
        targetProtocolAddressMaskError: false,
        tripletValue: "",
      },
      () => {
        if (this.validateARPForm()) {
          this.calculateARPTriplet();
          this.setState({
            arpSubmit: true,
          });
        }
      }
    );
  }

  calculateARPTriplet() {
    let othersOffset = 0;

    for (let i = 0; i < MY_GLOBAL.headersSelected.length; i++) {
      if (MY_GLOBAL.headersSelected[i] === "ARP") break;
      else if (MY_GLOBAL.headersSelected[i] === "Ethernet") othersOffset += 14;
      else if (MY_GLOBAL.headersSelected[i] === "MPLS") othersOffset += 4;
      else if (MY_GLOBAL.headersSelected[i] === "PW Control Word")
        othersOffset += 4;
      else if (MY_GLOBAL.headersSelected[i] === "PPPoE") othersOffset += 12;
      else if (MY_GLOBAL.headersSelected[i] === "IPv4") othersOffset += 20;
      else if (MY_GLOBAL.headersSelected[i] === "IPv6") othersOffset += 40;
      else if (MY_GLOBAL.headersSelected[i] === "Dot1q") othersOffset += 4;
      else if (MY_GLOBAL.headersSelected[i] === "SRv6")
        othersOffset += MY_GLOBAL.srv6Length[i];
      else if (MY_GLOBAL.headersSelected[i] === "UDP") othersOffset += 8;
      else if (MY_GLOBAL.headersSelected[i] === "VXLAN") othersOffset += 24;
    }

    let temp1 = "";
    let temp2 = "";
    let hardwareTypeOffset = 0 + othersOffset;
    let hardwareTypeValue = "";
    let hardwareTypeMask = "ffff";
    let operationOffset = 6 + othersOffset;
    let operationValue = "";
    let operationMask = "ffff";
    let senderHardwareAddressOffset = 8 + othersOffset;
    let senderHardwareAddressValue = "";
    let senderHardwareAddressMask = "";
    let senderProtocolAddressOffset = 14 + othersOffset;
    let senderProtocolAddressValue = "";
    let senderProtocolAddressMask = "";
    let targetHardwareAddressOffset = 18 + othersOffset;
    let targetHardwareAddressValue = "";
    let targetHardwareAddressMask = "";
    let targetProtocolAddressOffset = 24 + othersOffset;
    let targetProtocolAddressValue = "";
    let targetProtocolAddressMask = "";
    let ans = "";


    if (this.state.hardwareType !== "") {
      hardwareTypeValue = parseInt(this.state.hardwareType).toString(16);
      if (hardwareTypeValue.length === 1 || hardwareTypeValue.length === 2) {
        hardwareTypeOffset += 1;
        hardwareTypeMask = "ff";
        if (hardwareTypeValue.length === 1) {
          temp1 = "0";
        }
      } else if (hardwareTypeValue.length === 3) {
        temp1 = "0";
      }

      ans +=
        "Hardware Type: Offset " +
        hardwareTypeOffset +
        " Value 0x" +
        temp1 +
        hardwareTypeValue +
        " Mask 0x" +
        hardwareTypeMask +
        "\n";
    }

    if (this.state.operation !== "") {
      operationValue = parseInt(this.state.operation).toString(16);
      if (operationValue.length === 1 || operationValue.length === 2) {
        operationOffset += 1;
        operationMask = "ff";
        if (operationValue.length === 1) {
          temp2 = "0";
        }
      } else if (operationValue.length === 3) {
        temp2 = "0";
      }

      ans +=
        "Operation: Offset " +
        operationOffset +
        " Value 0x" +
        temp2 +
        operationValue +
        " Mask 0x" +
        operationMask +
        "\n";
    }

    if(this.state.senderHardwareAddressMask !== ""){

      if (this.state.senderHardwareAddress !== "" ) {
        let senderHardwareAddressTemp1 = this.state.senderHardwareAddress.replace(/:/g, '').trim();
        let senderHardwareAddressTemp2 = this.state.senderHardwareAddressMask.replace(/:/g, '').trim();
        senderHardwareAddressValue = this.bitwiseAnd(senderHardwareAddressTemp1, senderHardwareAddressTemp2);
        ans +=
          "Sender Hardware Address: Offset " +
          senderHardwareAddressOffset +
          " Value 0x" +
          senderHardwareAddressValue.slice(0, senderHardwareAddressValue.length / 2) +
          " Mask 0x" +
          senderHardwareAddressTemp2.slice(0, senderHardwareAddressTemp2.length / 2)  +
          "\n";

        senderHardwareAddressOffset += 3;
        
        ans +=
        "Sender Hardware Address: Offset " +
        senderHardwareAddressOffset +
        " Value 0x" +
        senderHardwareAddressValue.slice(senderHardwareAddressValue.length / 2) +
        " Mask 0x" +
        senderHardwareAddressTemp2.slice(senderHardwareAddressTemp2.length / 2)  +
        "\n";

        senderHardwareAddressValue = "";
        senderHardwareAddressMask = "";
        senderHardwareAddressOffset = 0;
      } else {
        let senderHardwareAddressTemp2 = this.state.senderHardwareAddressMask.replace(/:/g, '').trim();
        ans +=
          "Sender Hardware Address: Mask 0x" +
          senderHardwareAddressTemp2.slice(0, senderHardwareAddressTemp2.length / 2)  +
          "\n";

        ans +=
          "Sender Hardware Address: Mask 0x" +
          senderHardwareAddressTemp2.slice(senderHardwareAddressTemp2.length / 2)  +
          "\n";
        
        senderHardwareAddressValue = "";
        senderHardwareAddressMask = "";
      } 
    }
    
    if (this.state.senderProtocolAddress !== "") {
      let senderProtocolAddressTemp1 = this.state.senderProtocolAddress
        .replace(/^\s+|\s+$/g, "")
        .split(".");
      let senderProtocolAddressTemp2;
      if (this.state.senderProtocolAddressMask !== "") {
        senderProtocolAddressTemp2 = this.state.senderProtocolAddressMask
          .replace(/^\s+|\s+$/g, "")
          .split(".");
      } else {
        senderProtocolAddressTemp2 = "255.255.255.255".split(".");
      }

      let i = 3;
      let count = 0;
      while (senderProtocolAddressTemp2[i] === "0") {
        count++;
        i--;
      }
      for (let j = 0; j < 4 - count; j++) {
        if (parseInt(senderProtocolAddressTemp1[j]).toString(16).length === 1) {
          senderProtocolAddressValue += "0";
        }
        senderProtocolAddressValue += parseInt(senderProtocolAddressTemp1[j]).toString(16);
        if (parseInt(senderProtocolAddressTemp2[j]).toString(16).length === 1) {
          senderProtocolAddressMask += "0";
        }
        senderProtocolAddressMask += parseInt(senderProtocolAddressTemp2[j]).toString(16);
      }

      senderProtocolAddressValue = this.bitwiseAnd(senderProtocolAddressValue, senderProtocolAddressMask);
      ans +=
        "Source IP: Offset " +
        senderProtocolAddressOffset +
        " Value 0x" +
        senderProtocolAddressValue +
        " Mask 0x" +
        senderProtocolAddressMask +
        "\n";
    }


    if(this.state.targetHardwareAddressMask !== ""){

      if (this.state.targetHardwareAddress !== "" ) {
        let targetHardwareAddressTemp1 = this.state.targetHardwareAddress.replace(/:/g, '').trim();
        let targetHardwareAddressTemp2 = this.state.targetHardwareAddressMask.replace(/:/g, '').trim();
        targetHardwareAddressValue = this.bitwiseAnd(targetHardwareAddressTemp1, targetHardwareAddressTemp2);
        ans +=
          "Target Hardware Address: Offset " +
          targetHardwareAddressOffset +
          " Value 0x" +
          targetHardwareAddressValue.slice(0, targetHardwareAddressValue.length / 2) +
          " Mask 0x" +
          targetHardwareAddressTemp2.slice(0, targetHardwareAddressTemp2.length / 2)  +
          "\n";

        targetHardwareAddressOffset += 3;
        
        ans +=
        "Target Hardware Address: Offset " +
        targetHardwareAddressOffset +
        " Value 0x" +
        targetHardwareAddressValue.slice(targetHardwareAddressValue.length / 2) +
        " Mask 0x" +
        targetHardwareAddressTemp2.slice(targetHardwareAddressTemp2.length / 2)  +
        "\n";

        targetHardwareAddressValue = "";
        targetHardwareAddressMask = "";
        targetHardwareAddressOffset = 0;
      } else {
        let targetHardwareAddressTemp2 = this.state.targetHardwareAddressMask.replace(/:/g, '').trim();
        ans +=
          "Target Hardware Address: Mask 0x" +
          targetHardwareAddressTemp2.slice(0, targetHardwareAddressTemp2.length / 2)  +
          "\n";

        ans +=
          "Target Hardware Address: Mask 0x" +
          targetHardwareAddressTemp2.slice(targetHardwareAddressTemp2.length / 2)  +
          "\n";
        
        targetHardwareAddressValue = "";
        targetHardwareAddressMask = "";
      } 
    }

    if (this.state.targetProtocolAddress !== "") {
      let targetProtocolAddressTemp1 = this.state.targetProtocolAddress
        .replace(/^\s+|\s+$/g, "")
        .split(".");
      let targetProtocolAddressTemp2;
      if (this.state.targetProtocolAddressMask !== "") {
        targetProtocolAddressTemp2 = this.state.targetProtocolAddressMask
          .replace(/^\s+|\s+$/g, "")
          .split(".");
      } else {
        targetProtocolAddressTemp2 = "255.255.255.255".split(".");
      }
  
      let i = 3;
      let count = 0;
      while (targetProtocolAddressTemp2[i] === "0") {
        count++;
        i--;
      }
      for (let j = 0; j < 4 - count; j++) {
        if (parseInt(targetProtocolAddressTemp1[j]).toString(16).length === 1) {
          targetProtocolAddressValue += "0";
        }
        targetProtocolAddressValue += parseInt(targetProtocolAddressTemp1[j]).toString(16);
        if (parseInt(targetProtocolAddressTemp2[j]).toString(16).length === 1) {
          targetProtocolAddressMask += "0";
        }
        targetProtocolAddressMask += parseInt(targetProtocolAddressTemp2[j]).toString(16);
      }
  
      targetProtocolAddressValue = this.bitwiseAnd(targetProtocolAddressValue, targetProtocolAddressMask);
      ans +=
        "Source IP: Offset " +
        targetProtocolAddressOffset +
        " Value 0x" +
        targetProtocolAddressValue +
        " Mask 0x" +
        targetProtocolAddressMask +
        "\n";
    }

    this.setState({
      tripletValue: ans,
    });
  }

  render() {
    return (
      <React.Fragment>
        <Card.Body>
          <Form>
            {/* protocol type */}
            <Form.Row>
            <Form.Group as={Col} controlId="formGridProtocolType">
                <Form.Label>
                  Protocol Type{" "}
                  <OverlayTrigger
                    placement="right"
                    delay={{ show: 250, hide: 400 }}
                    overlay={
                      <Tooltip>
                        Select the internetwork protocol for which the ARP request is intended{" "}
                      </Tooltip>
                    }
                  >
                    <small style={{ color: "#5DADE2" }}>
                      <FaQuestion />
                    </small>
                  </OverlayTrigger>
                </Form.Label>
              </Form.Group>

              <Form.Group as={Col} controlId="formGridTypeValue">
                <InputGroup>
                  <DropdownButton
                    as={InputGroup.Prepend}
                    variant="outline-secondary"
                    title={this.state.protocolType}
                    onSelect={this.handleTypeChange}
                  >
                    <DropdownItem eventKey="0">IPv4</DropdownItem>
                  </DropdownButton>
                
                </InputGroup>
              </Form.Group>
            </Form.Row>

            {/* hardware type */}
            <Form.Row>
              <Form.Group as={Col} controlId="formGridHardwareType">
                <Form.Label>
                  Hardware Type{" "}
                  <OverlayTrigger
                    placement="right"
                    delay={{ show: 250, hide: 1200 }}
                    overlay={
                    <Tooltip>Valid range = [0,65535]. Use only officially assigned codes mentioned in this &nbsp;
                      <a href="https://www.iana.org/assignments/arp-parameters/arp-parameters.xhtml" target="_blank">list</a>
                    </Tooltip>}
                  >
                    <small style={{ color: "#5DADE2" }}>
                      <FaQuestion />
                    </small>
                  </OverlayTrigger>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="hardwareType"
                  placeholder="Enter Hardware Type"
                  value={this.state.hardwareType}
                  onChange={this.handleChange}
                />
              </Form.Group>

            {/* operation */}
              <Form.Group as={Col} controlId="formGridOperation">
                <Form.Label>
                  Operation{" "}
                  <OverlayTrigger
                    placement="bottom"
                    delay={{ show: 250, hide: 1200 }}
                    overlay={
                      <Tooltip>Valid range = [0,65535]. Use only officially assigned codes mentioned in this &nbsp;
                      <a href="https://www.iana.org/assignments/arp-parameters/arp-parameters.xhtml" target="_blank">list</a>
                      </Tooltip>}
                  >
                    <small style={{ color: "#5DADE2" }}>
                      <FaQuestion />
                    </small>
                  </OverlayTrigger>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="operation"
                  placeholder="Enter Operation"
                  value={this.state.operation}
                  onChange={this.handleChange}
                />
              </Form.Group>

            </Form.Row>

            
            {/* Sender Hardware Address */}
            <Form.Row>
            <Form.Group as={Col} controlId="formGridSenderHardwareAddress">
              <Form.Label>
                Sender Hardware Address{" "}
                <OverlayTrigger
                  placement="right"
                  delay={{ show: 250, hide: 400 }}
                  overlay={
                    <Tooltip>
                      Format to be followed: x:x:x:x:x:x where
                      x=00...ff{" "}
                    </Tooltip>
                  }
                >
                  <small style={{ color: "#5DADE2" }}>
                    <FaQuestion />
                  </small>
                </OverlayTrigger>
              </Form.Label>
              <Form.Control
                type="text"
                name="senderHardwareAddress"
                placeholder="Enter Sender Hardware Address"
                value={this.state.senderHardwareAddress}
                onChange={this.handleChange}
              />
            </Form.Group>

            <Form.Group as={Col} controlId="formGridSenderHardwareAddressMask">
              <Form.Label>
              Sender Hardware Address Mask{" "}
                <OverlayTrigger
                  placement="bottom"
                  delay={{ show: 250, hide: 400 }}
                  overlay={
                    <Tooltip>
                      Maximum 6 octets can be matched. Format to be followed:
                      x:x:x:x:x:x where x=00...ff{" "}
                    </Tooltip>
                  }
                >
                  <small style={{ color: "#5DADE2" }}>
                    <FaQuestion />
                  </small>
                </OverlayTrigger>
              </Form.Label>
              <Form.Control
                type="text"
                name="senderHardwareAddressMask"
                placeholder="Enter Sender Hardware Address Mask"
                value={this.state.senderHardwareAddressMask}
                onChange={this.handleChange}
              />
            </Form.Group>
            </Form.Row>

            {/* Sender Protocol Address */}
            <Form.Row>
              <Form.Group as={Col} controlId="formGridSenderProtocolAddress">
                <Form.Label>
                  Sender Protocol Address{" "}
                  <OverlayTrigger
                    placement="bottom"
                    delay={{ show: 250, hide: 400 }}
                    overlay={
                      <Tooltip>
                        Format to be followed: x.x.x.x where x=[0,255]{" "}
                      </Tooltip>
                    }
                  >
                    <small style={{ color: "#5DADE2" }}>
                      <FaQuestion />
                    </small>
                  </OverlayTrigger>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="senderProtocolAddress"
                  placeholder="Enter Sender Protocol Address"
                  value={this.state.senderProtocolAddress}
                  onChange={this.handleChange}
                />
              </Form.Group>

              <Form.Group as={Col} controlId="formGridSenderProtocolAddressMask">
                <Form.Label>
                  Sender Protocol Address Mask{" "}
                  <OverlayTrigger
                    placement="bottom"
                    delay={{ show: 250, hide: 400 }}
                    overlay={
                      <Tooltip>
                        Format to be followed: x.x.x.x where x=[0,255]{" "}
                      </Tooltip>
                    }
                  >
                    <small style={{ color: "#5DADE2" }}>
                      <FaQuestion />
                    </small>
                  </OverlayTrigger>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="senderProtocolAddressMask"
                  placeholder="Enter Sender Protocol Address Mask"
                  value={this.state.senderProtocolAddressMask}
                  onChange={this.handleChange}
                />
              </Form.Group>
              
            </Form.Row>

            {/* Target Hardware Address */}
            <Form.Row> 
              <Form.Group as={Col} controlId="formGridTargetHardwareAddress">
                <Form.Label>
                  Target Hardware Address{" "}
                  <OverlayTrigger
                    placement="right"
                    delay={{ show: 250, hide: 400 }}
                    overlay={
                      <Tooltip>
                        Format to be followed: x:x:x:x:x:x where
                        x=00...ff{" "}
                      </Tooltip>
                    }
                  >
                    <small style={{ color: "#5DADE2" }}>
                      <FaQuestion />
                    </small>
                  </OverlayTrigger>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="targetHardwareAddress"
                  placeholder="Enter Target Hardware Address"
                  value={this.state.targetHardwareAddress}
                  onChange={this.handleChange}
                />
              </Form.Group>

              <Form.Group as={Col} controlId="formGridTargetHardwareAddressMask">
                <Form.Label>
                Target Hardware Address Mask{" "}
                  <OverlayTrigger
                    placement="bottom"
                    delay={{ show: 250, hide: 400 }}
                    overlay={
                      <Tooltip>
                        Maximum 6 octets can be matched. Format to be followed:
                        x:x:x:x:x:x where x=00...ff{" "}
                      </Tooltip>
                    }
                  >
                    <small style={{ color: "#5DADE2" }}>
                      <FaQuestion />
                    </small>
                  </OverlayTrigger>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="targetHardwareAddressMask"
                  placeholder="Enter Target Hardware Address Mask"
                  value={this.state.targetHardwareAddressMask}
                  onChange={this.handleChange}
                />
              </Form.Group>



            </Form.Row>

            {/* Target Protocol Address */}
            <Form.Row>
              <Form.Group as={Col} controlId="formGridTargetProtocolAddress">
                <Form.Label>
                  Target Protocol Address{" "}
                  <OverlayTrigger
                    placement="bottom"
                    delay={{ show: 250, hide: 400 }}
                    overlay={
                      <Tooltip>
                        Format to be followed: x.x.x.x where x=[0,255]{" "}
                      </Tooltip>
                    }
                  >
                    <small style={{ color: "#5DADE2" }}>
                      <FaQuestion />
                    </small>
                  </OverlayTrigger>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="targetProtocolAddress"
                  placeholder="Enter Target Protocol Address"
                  value={this.state.targetProtocolAddress}
                  onChange={this.handleChange}
                />
              </Form.Group>

              <Form.Group as={Col} controlId="formGridTargetProtocolAddressMask">
                <Form.Label>
                Target Protocol Address Mask{" "}
                  <OverlayTrigger
                    placement="bottom"
                    delay={{ show: 250, hide: 400 }}
                    overlay={
                      <Tooltip>
                        Format to be followed: x.x.x.x where x=[0,255]{" "}
                      </Tooltip>
                    }
                  >
                    <small style={{ color: "#5DADE2" }}>
                      <FaQuestion />
                    </small>
                  </OverlayTrigger>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="targetProtocolAddressMask"
                  placeholder="Enter Target Protocol Address Mask"
                  value={this.state.targetProtocolAddressMask}
                  onChange={this.handleChange}
                />
              </Form.Group>
              
            </Form.Row>

            {this.state.emptyError ? (
              <small>
                <Alert variant="danger">All the fields can't be empty</Alert>
              </small>
            ) : null}
            {this.state.hardwareTypeError ? (
              <small>
                <Alert variant="danger">Invalid Hardware Type</Alert>
              </small>
            ) : null}
            {this.state.operationError ? (
              <small>
                <Alert variant="danger">Invalid Operation</Alert>
              </small>
            ) : null}
            {this.state.senderHardwareAddressError ? (
              <small>
                <Alert variant="danger">Invalid Sender Hardware Address</Alert>
              </small>
            ) : null}
            {this.state.senderHardwareAddressMaskEmptyError ? (
              <small>
                <Alert variant="danger">Sender Hardware Address Mask can't be empty</Alert>
              </small>
            ) : null}
            {this.state.senderHardwareAddressMaskError ? (
              <small>
                <Alert variant="danger">Invalid Sender Hardware Address Mask</Alert>
              </small>
            ) : null}
            {this.state.senderProtocolAddressError ? (
              <small>
                <Alert variant="danger">Invalid Sender Protocol Address</Alert>
              </small>
            ) : null}
            {this.state.senderProtocolAddressMaskEmptyError ? (
              <small>
                <Alert variant="danger">Sender Protocol Address Mask can't be empty</Alert>
              </small>
            ) : null}
            {this.state.senderProtocolAddressMaskError ? (
              <small>
                <Alert variant="danger">Invalid Sender Protocol Address Mask</Alert>
              </small>
            ) : null}
            {this.state.targetHardwareAddressError ? (
              <small>
                <Alert variant="danger">Invalid Target Hardware Address</Alert>
              </small>
            ) : null}
            {this.state.targetHardwareAddressMaskEmptyError ? (
              <small>
                <Alert variant="danger">Target Hardware Address Mask can't be empty</Alert>
              </small>
            ) : null}
            {this.state.targetHardwareAddressMaskError ? (
              <small>
                <Alert variant="danger">Invalid Target Hardware Address Mask</Alert>
              </small>
            ) : null}
            {this.state.targetProtocolAddressError ? (
              <small>
                <Alert variant="danger">Invalid Target Protocol Address</Alert>
              </small>
            ) : null}
            {this.state.targetProtocolAddressMaskEmptyError ? (
              <small>
                <Alert variant="danger">Target Protocol Address Mask can't be empty</Alert>
              </small>
            ) : null}
            {this.state.targetProtocolAddressMaskError ? (
              <small>
                <Alert variant="danger">Invalid Target Protocol Address Mask</Alert>
              </small>
            ) : null}

            {/* modified */}
            <Button
              variant="success"
              onClick={() => {
                this.handleARPSubmit();
                this.props.step3();
              }}
            >
              Submit
            </Button>
          </Form>
        </Card.Body>
        {/* Renders DisplayTriplets component in the Card footer. */}
        {this.state.arpSubmit ? (
          <DisplayTriplets action={this.state.tripletValue} />
        ) : null}
      </React.Fragment>
    );
  }
}

export default ARPForm;