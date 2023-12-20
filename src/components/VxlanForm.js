import React, { Component } from "react";
import {
  Col,
  Form,
  Button,
  Card,
  OverlayTrigger,
  Tooltip,
  Alert,
} from "react-bootstrap";
import { FaQuestion } from "react-icons/fa";
import MY_GLOBAL from "./Globals";
import DisplayTriplets from "./DisplayTriplets";

export class VXLANForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      vxlanSubmit: false,
      vni: "",
      emptyError: false,
      vniError: false,
      tripletValue: "",
    };

    this.validateVNI = this.validateVNI.bind(this);
    this.calculateVXLANTriplet = this.calculateVXLANTriplet.bind(this);
    this.validateVXLANForm = this.validateVXLANForm.bind(this);
    this.handleVXLANSubmit = this.handleVXLANSubmit.bind(this);
  }

  handleChange = (event) => {
    const isCheckbox = event.target.type === "checkbox";
    this.setState({
      [event.target.name]: isCheckbox
        ? event.target.checked
        : event.target.value,
    });
  };

  validateVNI() {
    let val = parseInt(this.state.vni);
    if (val >= 0 && val <= 16777215) return true;
    this.setState(
      {
        vniError: true,
      },
      () => {
        return false;
      }
    );
  }

  validateVXLANForm() {
    if (this.state.vni === "") {
      this.setState(
        {
          emptyError: true,
        },
        () => {
          return false;
        }
      );
    } else {
      if (!this.validateVNI()) return false;
      return true;
    }
  }

  calculateVXLANTriplet() {
    let othersOffset = 0;

    for (let i = 0; i < MY_GLOBAL.headersSelected.length; i++) {
      if (MY_GLOBAL.headersSelected[i] === "VXLAN") break;
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
      else if (MY_GLOBAL.headersSelected[i] === "ARP") othersOffset += 28;
    }

    let vniOffset = othersOffset + 4; // VNI field starts after 4 bytes in VXLAN header
    let vniValue = parseInt(this.state.vni).toString(16);
    let vniMask = "ffffff"; // 24 bits

    let ans = "VNI: Offset " + vniOffset + " Value 0x" + vniValue + " Mask 0x" + vniMask;
    this.setState({
      tripletValue: ans,
    });
  }

  handleVXLANSubmit() {
    this.setState(
      {
        vxlanSubmit: false,
        emptyError: false,
        vniError: false,
        tripletValue: "",
      },
      () => {
        if (this.validateVXLANForm()) {
          this.calculateVXLANTriplet();
          this.setState({
            vxlanSubmit: true,
          });
        }
      }
    );
  }

  render() {
    return (
      <React.Fragment>
        <Card.Body>
          <Form>
            <Form.Row>
              <Form.Group as={Col} controlId="formGridVNI">
                <Form.Label>
                  VNI{" "}
                  <OverlayTrigger
                    placement="right"
                    delay={{ show: 250, hide: 400 }}
                    overlay={<Tooltip>Valid range = [0,16777215] </Tooltip>}
                  >
                    <small style={{ color: "#5DADE2" }}>
                      <FaQuestion />
                    </small>
                  </OverlayTrigger>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="vni"
                  placeholder="Enter VNI"
                  value={this.state.vni}
                  onChange={this.handleChange}
                />
              </Form.Group>
            </Form.Row>
            {this.state.emptyError ? (
              <small>
                <Alert variant="danger">VNI field can't be empty</Alert>
              </small>
            ) : null}
            {this.state.vniError ? (
              <small>
                <Alert variant="danger">Invalid VNI</Alert>
              </small>
            ) : null}

            <Button
              variant="success"
              onClick={() => {
                this.handleVXLANSubmit();
                this.props.step3();
              }}
            >
              Submit
            </Button>
          </Form>
        </Card.Body>
        {this.state.vxlanSubmit ? (
          <DisplayTriplets action={this.state.tripletValue} />
        ) : null}
      </React.Fragment>
    );
  }
}

export default VXLANForm;