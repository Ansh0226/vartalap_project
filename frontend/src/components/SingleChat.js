import { ChatState } from "../Context/ChatProvider";
import React, { useEffect, useState, useCallback } from "react";
import { Box, Text } from "@chakra-ui/layout";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { IconButton } from "@chakra-ui/button";
import ProfileModal from "./miscellaneous/ProfileModal";
import { getSender, getSenderFull } from "../config/ChatLogics";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import { Spinner, FormControl, Input, useToast } from "@chakra-ui/react";
import axios from "axios";
import "./styles.css";
import ScrollableChat from "../components/ScrollableChat";
import io from "socket.io-client";
import logo from "./logo.jpg";

const ENDPOINT = "http://localhost:5000";
let socket;
let selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const toast = useToast();

  const { user, selectedChat, setSelectedChat, notification, setNotification } =
    ChatState();

  const fetchMessages = useCallback(async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );

      setMessages(data);
      setLoading(false);
      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  }, [selectedChat, user.token, toast]);

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setTyping(true));
    socket.on("stop typing", () => setTyping(false));
  }, []);

  useEffect(() => {
    fetchMessages();

    selectedChatCompare = selectedChat;
  }, [selectedChat, fetchMessages]);

  useEffect(() => {
    if (!socket) return;

    socket.on("message received", (newMessageReceived) => {
      if (!selectedChat || selectedChat._id !== newMessageReceived.chat._id) {
        if (!notification.includes(newMessageReceived)) {
          setNotification([newMessageReceived, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages((prevMessages) => [...prevMessages, newMessageReceived]);
      }
    });

    socket.on("typing", () => {
      setIsTyping(true);
    });

    socket.on("stop typing", () => {
      setIsTyping(false);
    });

    return () => {
      socket.off("message received");
      socket.off("typing");
      socket.off("stop typing");
    };
  }, [socket, selectedChat, notification, fetchAgain]);

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewMessage("");
        const { data } = await axios.post(
          "/api/message",
          {
            content: newMessage,
            chatId: selectedChat._id,
          },
          config
        );

        socket.emit("new message", data);
        setMessages([...messages, data]);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    setTimeout(() => {
      setTyping(false);
      socket.emit("stop typing", selectedChat._id);
    }, 3000);
  };

  return selectedChat ? (
    <>
      <Text
        fontSize={{ base: "28px", md: "30px" }}
        pb={3}
        px={2}
        w="100%"
        fontFamily="Work sans"
        display="flex"
        justifyContent={{ base: "space-between" }}
        alignItems="center"
      >
        <IconButton
          display={{ base: "flex", md: "none" }}
          icon={<ArrowBackIcon />}
          onClick={() => setSelectedChat("")}
        />
        {!selectedChat.isGroupChat ? (
          <>
            {getSender(user, selectedChat.users)}
            {/* designing for profile eye icon  */}
            <ProfileModal user={getSenderFull(user, selectedChat.users)} />
          </>
        ) : (
          <>
            {/* for selected chat name heading */}

            <div className="" style={{ color: "white", fontFamily: "Tahoma" }}>
              {selectedChat.chatName.toUpperCase()}{" "}
            </div>
            <UpdateGroupChatModal
              fetchAgain={fetchAgain}
              setFetchAgain={setFetchAgain}
              fetchMessages={fetchMessages}
            />
          </>
        )}
      </Text>

      <Box
        display="flex"
        flexDir="column"
        justifyContent="flex-end"
        p={3}
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="hidden"
        // for chat box pannel
        style={{ background: "#0F1217", color: "rgba(0.4,0.6,0.3,0.8)" }}
      >
        {loading ? (
          <Spinner
            size="xl"
            w={20}
            h={20}
            alignSelf="center"
            margin="auto"
            color="white"
          />
        ) : (
          <div className="messages">
            <ScrollableChat messages={messages} />
          </div>
        )}
        {/* Input box for typing messages  */}
        <FormControl onKeyDown={sendMessage} isRequired mt={3}>
          {isTyping ? (
            <div
              style={{
                margin: "10px",
                color: "white",
                width: "90px",
                borderRadius: "3px",
                background: "gray",
                padding: "10px",
                border: "1px solid white",
              }}
            >
              typing....
            </div>
          ) : (
            <></>
          )}
          <Input
            variant="filled"
            bg="#E0E0E0"
            placeholder="Enter a message.."
            color="white"
            background="#BEE3F8"
            value={newMessage}
            onChange={typingHandler}
          />
        </FormControl>
      </Box>
    </>
  ) : (
    <Box
      alignItems="center"
      justifyContent="center"
      style={{ height: "100%", display: "flex" }}
    >
      <Text
        fontSize="3xl"
        pb={3}
        style={{ color: "#38B2AC", fontFamily: "Cambria" }}
      >
        Click on a user to start chatting
      </Text>
    </Box>
  );
};

export default SingleChat;
