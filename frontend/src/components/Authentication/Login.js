import React , {useState} from 'react';
import { Field, Input,InputGroup, Button, FieldRequiredIndicator, VStack, Show } from '@chakra-ui/react';
import { toaster } from '../ui/toaster';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { ChatState } from '../../Context/chatProvider';

const Login = () => {
  const [Email , SetEmail]= useState()
  const [Password , SetPassword]= useState("")
  const [Show, setShow] = useState(false)
  const [loading, setLoading] = useState(false);
  const {setUser} = ChatState()
  const togglePassword =() => setShow(!Show)
  const history = useHistory()
  
  const submitHandler = async() => {
    setLoading(true);
    if (!Email || !Password) {
      toaster.create({
        title: "Please Fill all the Feilds",
        type: "warning",
        
      });
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      const { data } = await axios.post(
        "http://localhost:5000/api/user/login",
        { Email, Password },
        config
      );

      toaster.create({
        title: "Login Successful",
        type: 'success'
      });
      
      localStorage.setItem("userInfo", JSON.stringify(data));
setUser(data);
setLoading(false)
history.push("/chats");
    } catch (error) {
      toaster.create({
        title: "Error Occured!",
        description: error.response.data.message,
        type:'error'
      });
      setLoading(false);
    }
  };
  return (
    <VStack>
      <Field.Root id='Email' required>
              
              <Field.Label>Email
                <FieldRequiredIndicator/>
              </Field.Label>
              
              <Input 
                placeholder="Enter Your Email" 
                onChange={(e) => SetEmail(e.target.value)} 
              />
            </Field.Root>
            <Field.Root id='Password' required>

              
              <Field.Label>Password
                <FieldRequiredIndicator/>
              </Field.Label>
              <InputGroup flex='1' width='50%' endElement={ <Button bg='white' type='subtle' h='1.75rem' size='sm' onClick={togglePassword} variant='ghost'>
                    {Show ? "Hide": "Show"}
                  </Button> }>
              
                  <Input type={Show ? "text":"password"}
                    placeholder="Enter Your Password" 
                    onChange={(e) => SetPassword(e.target.value)} 
                    />
                  
                </InputGroup>
              </Field.Root>
            <Button  colorPalette="teal" bg='blue' colorScheme="blue" width="100%" style={{marginTop: 15}} onClick={submitHandler} loading={loading}>Login</Button>
            <Button variant='solid' colorScheme='dark' width='100%' bg='red.500' onClick={()=> { SetEmail('guest123@gmail.com'); SetPassword('1234')}}>
              Get Guest User Credentials
            </Button>
    </VStack>
  );
}

export default Login;
