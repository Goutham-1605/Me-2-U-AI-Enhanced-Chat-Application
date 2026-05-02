import React from "react";
import { IconButton, Dialog, Button, Portal , Image, Avatar, Text} from "@chakra-ui/react";
import { FiEye } from "react-icons/fi";

const ProfileModal = ({ user, children }) => {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        {children ? children : (
          <IconButton size="xs" aria-label="View Profile">
            <FiEye />
          </IconButton>
        )}
      </Dialog.Trigger>

      <Portal>
        <Dialog.Backdrop />

        <Dialog.Positioner>
          <Dialog.Content bg="white" p={6} maxW="400px" borderRadius="md">

            <Dialog.Header>
              <Dialog.Title>{user?.Name}'s Profile</Dialog.Title>
            </Dialog.Header>

            <Dialog.Body display="flex" flexDirection="column" alignItems="center" gap={4}>
  
  <Avatar.Root size="2xl">
    <Avatar.Image src={user?.Pic} />
    <Avatar.Fallback name={user?.Name || "User"} />
  </Avatar.Root>
  <Text fontSize="xl" fontWeight="bold">
    {user?.Name}
  </Text>

  
  <Text fontSize="md" color="gray.500">
    {user?.Email}
  </Text>

</Dialog.Body>

            <Dialog.Footer>
              <Dialog.CloseTrigger asChild>
                <Button colorPalette="blue">Close</Button>
              </Dialog.CloseTrigger>
            </Dialog.Footer>

          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default ProfileModal;