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



const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const toast = useToast();

  const { user, selectedChat, setSelectedChat } = ChatState();

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
      // console.log(messages);

      setMessages(prevMessages => [...prevMessages, ...data]); // Merge new messages with existing ones
   
 
      setLoading(false);
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
    fetchMessages();
  }, [selectedChat, fetchMessages]);

  const sendMessage = async event => {
    if (event.key === "Enter" && newMessage) {
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
        console.log(data);

        setMessages(prevMessages => [...prevMessages, data]); // Append the new message to the existing messages
      } catch (error) {}
    }
  };

  const typingHandler = e => {
    setNewMessage(e.target.value);
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
            <ProfileModal user={getSenderFull(user, selectedChat.users)} />
          </>
        ) : (
          <>
            {selectedChat.chatName.toUpperCase()}
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
  bg="#E8E8E8"
  w="100%"
  h="100%"
  borderRadius="lg"
  overflowY="hidden"
>
  {loading ? (
    <Spinner 
    size="xl" 
    w={20} 
    h={20} 
    alignSelf="center"
     margin="auto"
      />
  ) : (
    
    // messages.map((message, index) => (
    //   <Text key={index}>{message.content}</Text> // Render the content of each message
    // )),
    <div className="messages">
                <ScrollableChat messages={messages} />
              </div>

  )}
  <FormControl onKeyDown={sendMessage} isRequired mt={3}>
    <Input
      variant="filled"
      bg="#E0E0E0"
      placeholder="Enter a message.."
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
      <Text fontSize="3xl" pb={3} fontFamily="Work sans">
        Click on a user to start chatting
      </Text>
    </Box>
  );
};

export default SingleChat;