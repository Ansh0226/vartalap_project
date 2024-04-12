import { Box, Text, Flex } from "@chakra-ui/layout";

import axios from "axios";
import { Spinner } from "@chakra-ui/spinner";
// import { useToast } from "@chakra-ui/toast";
import { Tooltip, background } from "@chakra-ui/react";
import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from "@chakra-ui/menu";

import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Input,
  useToast,
} from "@chakra-ui/react";
import { useDisclosure } from "@chakra-ui/hooks";
import { Avatar, AvatarGroup } from "@chakra-ui/avatar";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import React from "react";
import { useState } from "react";
import { Button } from "@chakra-ui/button";
import { ChatState } from "../../Context/ChatProvider";
import ProfileModal from "./ProfileModal";
import { useHistory } from "react-router-dom";
import ChatLoading from "../ChatLoading";
import UserListItem from "../UserAvatar/UserListItem";
import { getSender } from "../../config/ChatLogics";
import NotificationBadge from "react-notification-badge";
import { Effect } from "react-notification-badge";
import { ClassNames } from "@emotion/react";
const SideDrawer = () => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [chats, setChats] = useState([]);
  const { setSelectedChat, user, notification, setNotification } = ChatState();

  const history = useHistory();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    history.push("/");
  };

  const handleSearch = async (event) => {
    if (!search && event.type === "click") {
      toast({
        title: "Please Enter something in search",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }

    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`/api/user?search=${search}`, config);

      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const accessChat = async (userId) => {
    console.log(userId);

    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(`/api/chat`, { userId }, config);

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error fetching the chat",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  return (
    <>
      <Box
        // paddingTop="5px"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="black"
        color="white"
        w="100%"
        p="5px 10px 5px 10px"
        border="5px solid #20252B"
        // borderWidth="5px"
        // style={{borderRadius: "3px"}}
      >
        <Tooltip label="Search Users to Chat" hasArrow placement="bottom-end">
          <Button variant="ghost" onClick={onOpen} style={{ color: "white" }}>
            <i class="fas fa-search" style={{ color: "#38B2AC" }}></i>
            <Text
              display={{ base: "none", md: "flex" }}
              px="4"
              // background="black"
              style={{ color: "#38B2AC" }}
            >
              Search User
            </Text>
          </Button>
        </Tooltip>

        <Text
          fontSize="2xl"
          fontFamily="cursive"
          style={{ fontSize: "30px", color: "#38B2AC" }}
        >
          Vartalap
        </Text>

        <div>
          <Menu>
            <MenuButton p={1} >
              <BellIcon fontSize="2xl" m={1} color="#38B2AC" />
            </MenuButton>
            <MenuList pl={2}>
              <NotificationBadge
                count={notification.length}
                effect={Effect.SCALE}
                
              />
              {!notification.length && "No New Messages"}
              {notification.map((notif) => (
                <MenuItem
                  key={notif._id}
                  onClick={() => {
                    setSelectedChat(notif.chat);
                    setNotification(notification.filter((n) => n !== notif));
                  }}
                >
                  {notif.chat.isGroupChat
                    ? `New Message in ${notif.chat.chatName}`
                    : `New Message from ${getSender(user, notif.chat.users)}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              <Avatar
                size="sm"
                cursor="pointer"
                name={user.name}
                src={user.pic}
              />
            </MenuButton>
            <MenuList style={{ background: "black" }}>
              <ProfileModal user={user}>
                <MenuItem style={{ background: "black" }}>My Profile</MenuItem>
              </ProfileModal>

              <MenuDivider></MenuDivider>
              <MenuItem onClick={logoutHandler} style={{ background: "black" }}>
                Logout
              </MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>

      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent
        // background="rgba(0,0,0,0.2)"
        >
          <DrawerHeader
            borderBottomWidth={"1px"}
            background="black"
            color="#38B2AC"
            textAlign="center"
            fontSize="2rem"
            fontFamily="cursive"
          >
            Vartalap{" "}
          </DrawerHeader>
          <DrawerBody background="black">
            <Box display="flex" pb={2}>
              <Input
                placeholder="Search by name or email"
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearch}
                background="black"
                color="white"
                border="none"
                outline="none"
                style={{ border: "2px solid #38B2AC" }}
                fontFamily="cursive"
              />
              <Button onClick={handleSearch} background="#38B2AC">
                Go
              </Button>
            </Box>

            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
            {loadingChat && <Spinner ml="auto" display="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SideDrawer;
