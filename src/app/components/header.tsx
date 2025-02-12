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
  const [profileModalOpened, setProfileModalOpened] = useState(false);
  const [userGender, setUserGender] = useState(user?.gender);
  const [userGeneration, setUserGeneration] = useState(user?.generation);

  const createUser = async (userData: {
    id: string;
    name: string;
    generation: string;
    gender: string;
    image: string;
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
    if (!user || !userGeneration || !userGender) {
      alert(`User not defined: ${user}`);
      return;
    }

    const userData = {
      id: user.id,
      name: user.name,
      image: user.image,
      generation: userGeneration,
      gender: userGender,
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

  return (
    <Group justify="flex-end" h="100%" w="100%" pr="xs">
      <Menu>
        <MenuTarget>
          <Avatar component="button" radius="xl" size="md" src={user?.image} />
        </MenuTarget>
        <MenuDropdown>
          {session?.user ? (
            <>
              <MenuItem onClick={handleSignOut}>Sign out</MenuItem>
              <MenuItem onClick={() => setProfileModalOpened(true)}>Profile</MenuItem>
            </>
          ) : (
            <MenuItem onClick={handleSignIn}>Sign in</MenuItem>
          )}
        </MenuDropdown>
      </Menu>
      {user && (
        <Modal
          opened={profileModalOpened}
          onClose={() => setProfileModalOpened(false)}
          title={
            <Group>
              <Avatar size="sm" src={user.image} />
              <Text>Profile</Text>
            </Group>
          }
        >
          <Stack>
            <TextInput required disabled label="Name" placeholder="Name" value={user.name} />
            <TextInput required disabled label="Email" placeholder="Email" value={user.id} />
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
      )}
    </Group>
  );
}
