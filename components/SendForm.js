import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Button,
  TextInput,
  Share,
  Modal,
  TouchableOpacity
} from "react-native";
import AsyncStorage from "@react-native-community/async-storage";

import { globalStyles } from "../constants/styles";
import { Formik } from "formik";
import QRCode from "react-qr-code";

//console.log(globalStyles);
const SendForm = props => {
  const [modalVisible, setModalVisible] = useState(false);
  const [sendLink, setSendLink] = useState("");
  const [amount, setAmount] = useState(false);

  setClipBoardContent = async content => {
    await Clipboard.setString(content);
  };

  onShare = async () => {
    try {
      const result = await Share.share({
        message: sendLink
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log(result.activityType);
        } else {
          console.log("Shared", result);
        }
      } else if (result.action === Share.dismissedAction) {
        console.log("dismissed");
        // dismissed
      }
    } catch (error) {
      console.log(error);
      setClipBoardContent("https://vimeo.com/331858758");
    }
  };

  getSendLinkPost = async (amount, senderAddress) => {
    const postBody = {
      amount,
      senderAddress
    };
    let response = await fetch(
      `https://rx4y9fk2r8.execute-api.us-east-1.amazonaws.com/dev/links/send`,
      {
        method: "post",
        body: JSON.stringify(postBody)
      }
    );
    return await response.json();
  };

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
        }}
      >
        <View style={globalStyles.container}>
          <View>
            <Button
              title="Hide Modal"
              onPress={() => {
                setModalVisible(false);
              }}
            />

            <Text style={globalStyles.currencyHeading}>Send {amount} DAI</Text>
            <Text style={globalStyles.textLink}>{sendLink}</Text>
            <QRCode value={sendLink} />

            <Button
              title="Share"
              onPress={() => {
                onShare();
                setModalVisible(false);
              }}
            />
          </View>
        </View>
      </Modal>
      <Formik
        initialValues={{ amount: "" }}
        onSubmit={async values => {
          setAmount(values.amount);
          const accountAddress = await AsyncStorage.getItem("accountAddress");
          const sendObj = await getSendLinkPost(values.amount, accountAddress);
          setSendLink(sendObj.url);
          setModalVisible(true);
          values.amount = "";
        }}
        validate={values => {
          let errors = {};
          if (!values.amount) {
            errors.amount = "Required";
          }
          return errors;
        }}
      >
        {props => (
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <Text style={globalStyles.currencyHeading}>You will send</Text>
            <Image source={require("../assets/diamond.png")} />
            <View style={globalStyles.inputRow}>
              <TextInput
                style={globalStyles.inputText}
                onChangeText={props.handleChange("amount")}
                onBlur={props.handleBlur("amount")}
                value={props.values.amount}
                keyboardType="numeric"
                maxLength={10}
                placeholder={"0.00"}
              />
              <Text style={globalStyles.inputTextRight}>DAI</Text>
            </View>

            <TouchableOpacity onPress={props.handleSubmit}>
              <Text style={globalStyles.bigButton}>
                <Image
                  style={globalStyles.Icon}
                  source={require("../assets/send.png")}
                  resizeMode="contain"
                />
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </Formik>
    </View>
  );
};
export default SendForm;
