import React from "react";
import {
  Container,
  Box,
  Text,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import { useEffect } from "react";
import Login from "../components/Authentication/Login";
import SignUp from "../components/Authentication/SignUp";
import { useHistory } from "react-router-dom";


const Homepage = () => {
  const history = useHistory();
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));

    if (user) {
      history.push("chats");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);

  return (
    <Container maxW="xl" centerContent>
      <Box
        textAlign={"center"}
        display="flex"
        justifyContent="center"
        p={3}
        // bg={"#FEEAFA"}
        w={"100%"}
        m=" 40px 0 15px 0"
        borderRadius="lg"

        // borderWidth="1px"
      >
        <Text
          fontSize="3xl"
          fontFamily={"Fantasy"}
          color={"#38B2AC"}
          fontWeight={"larger"}
          fontSize={"4rem"}
          fontFamily={"cursive"}
        >
          Vartalap
        </Text>
      </Box>
      <Box
        bg="#FEEEFB "
        w="100%"
        p={4}
        borderRadius="lg"
        borderWidth={"1px"}
        background="rgba(0,0,0,0.8)"
        color="white"
        
      >
        <Tabs variant="soft-rounded" color="white">
          <TabList mb="1em" style={{ background: "#38B2AC" }}>
            <Tab width={"50%"}>Login</Tab>
            <Tab width={"50%"}>Sign Up</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Login />
            </TabPanel>
            <TabPanel>
              <SignUp />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  );
};

export default Homepage;
