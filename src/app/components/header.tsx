"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import {
  Avatar,
  Group,
  Menu,
  MenuTarget,
  MenuDropdown,
  MenuItem,
  Modal,
  TextInput,
  Select,
  Button,
  Text,
  Stack,
} from "@mantine/core";
import { useContext, useState } from "react";
import { fetchGraphQL } from "../util";
import { AppContext } from "../appshell";

export function Header() {
  const { data: session } = useSession();
  const { user, setUser } = useContext(AppContext);
  const [opened, setOpened] = useState(false);
  const [userGender, setUserGender] = useState();
  const [userGeneration, setUserGeneration] = useState("");

  const createUser = async (userData: {
    id: string;
    name: string;
    generation: string;
    gender: string;
    image?: string;
  }) => {
    const query = `
      mutation CreateUser($id: ID!, $name: String!, $generation: String, $gender: String, $image: String) {
        createUser(id: $id, name: $name, generation: $generation, gender: $gender, image: $image) {
          id
          name
          image
          generation
          gender
        }
      }
    `;

    const response = await fetchGraphQL(
      query,
      {
        id: userData.id,
        name: userData.name,
        generation: userData.generation,
        gender: userData.gender,
        image: userData.image,
      },
      session?.accessToken
    );

    return response;
  };

  const handleSubmitUser = async () => {
    const userData = {
      id: user.id || "",
      name: user.name || "",
      generation: userGeneration || user.generation,
      gender: userGender || user.gender,
      image: user.image || "",
    };

    const res = await createUser(userData);
    setUser(res.createUser);
  };

  const handleSignIn = () => {
    signIn("google");
  };

  const handleSignOut = () => {
    signOut();
  };
  console.log(user.image)
  return (
    <Group justify="flex-end" h="100%" w="100%" pr="xs">
      <Menu>
        <MenuTarget>
          <Avatar component="button" radius="xl" size="md" src={user.image} />
        </MenuTarget>
        <MenuDropdown>
          {session?.user ? (
            <>
              <MenuItem onClick={handleSignOut}>Sign out</MenuItem>
              <MenuItem onClick={() => setOpened(true)}>Profile</MenuItem>
            </>
          ) : (
            <MenuItem onClick={handleSignIn}>Sign in</MenuItem>
          )}
        </MenuDropdown>
      </Menu>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={
          <Group>
            <Avatar size="sm" src={user.image} />
            <Text>Profile</Text>
          </Group>
        }
      >
        <Stack>
          <TextInput required disabled label="Name" placeholder="Name" value={user.name || ""} />
          <TextInput required disabled label="Email" placeholder="Email" value={user.id || ""} />
          <Select
            data={[
              { value: "Baby Boomer", label: "Baby Boomer, 1946 - 1964" },
              { value: "Gen X", label: "Gen X, 1965 - 1980" },
              { value: "Millenial", label: "Millenial, 1981 - 1996" },
              { value: "Gen Z", label: "Gen Z, 1997 - 2010" },
              { value: "Gen Alpha", label: "Gen Z, 2010 - 2024" },
            ]}
            value={user.generation || userGeneration}
            disabled={!!user.generation}
            label="Age Generation"
            required
            onChange={(updatedUserGeneration) => setUserGeneration(updatedUserGeneration)}
          />
          <Select
            data={[
              { value: "Male", label: "Male ♂" },
              { value: "Female", label: "Female ♀" },
              { value: "Other", label: "Other ⚥" },
            ]}
            value={user.gender || userGender}
            disabled={!!user.gender}
            label="Gender"
            required
            onChange={(updatedUserGender) => setUserGender(updatedUserGender)}
          />
          <Group justify="center">
            <Button w="100px" mt="md" onClick={handleSubmitUser}>
              SUBMIT
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Group>
  );
}
