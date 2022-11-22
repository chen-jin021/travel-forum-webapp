import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
} from '@chakra-ui/react'
import React from 'react'
import './Alert.scss'
import { useRecoilState, useRecoilValue } from 'recoil'
import { alertOpenState, alertTitleState, alertMessageState } from '../../global/Atoms'

export const Alert = () => {
  const [alertIsOpen, setAlertIsOpen] = useRecoilState(alertOpenState)
  const alertTitle = useRecoilValue(alertTitleState)
  const alertMessage = useRecoilValue(alertMessageState)
  const onClose = () => setAlertIsOpen(false)
  const cancelRef = React.useRef(null)

  return (
    <AlertDialog isOpen={alertIsOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            {alertTitle}
          </AlertDialogHeader>
          <AlertDialogBody>{alertMessage}</AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              Close
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  )
}
