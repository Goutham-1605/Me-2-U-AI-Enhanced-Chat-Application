/*import React, { useState } from 'react';
import { VStack ,Field,   Input,   FieldRequiredIndicator, InputGroup, Button, Show} from '@chakra-ui/react';
import { toaster } from '../ui/toaster';
import axios from 'axios';


import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';

const SignUp = () => {
  const [Name , SetName]= useState()
  const [Email , SetEmail]= useState()
  const [Password , SetPassword]= useState("")
  const [ConfirmPassword , SetConfirmPassword]= useState("")
  const [Pic , setPic]= useState()
  const [Show, setShow] = useState(false)
  const [loading, setLoading] = useState(false);
  const togglePassword =() => setShow(!Show)
  const history = useHistory()
  
  
  const postDetails = (pics) => {
    setLoading(true)
    if (pics===undefined){
      toaster.create({
        title: 'please select the image',
        type : "warning"
        
      })
      setLoading(false);
      return;

    }
    if (pics.type==="image/jpeg" || pics.type==="image/png"|| pics.type==="image/jpg"){
      const data = new FormData()
      data.append("file",pics)
      data.append("upload_preset","Me-2-U")
      data.append("cloud_name","dvzjchtyc")
      fetch("https://api.cloudinary.com/v1_1/dvzjchtyc/image/upload", {
  method: "post",
  body: data,
})
.then((res)=>res.json())
.then((data)=>{
  setPic(data.url.toString())
  setLoading(false)
})
.catch((err)=>{
  console.log(err);
});

}else {
  toaster.create({
        title: "please select the image",
        type : "warning"
        
      })
}

}

    
  
  const submitHandler = async() => {
    setLoading(true);
    if (!Name||!Email||!Password||!ConfirmPassword){

      toaster.create({
        title:"Please fill all the fields",
        type:"warning"
      });
      setLoading(false)
      return;
    }
    if (Password!=ConfirmPassword){
      toaster.create({
        title:"Password do not match",
        type:"warning"
      });
      return;
    }
    try {
      const config ={
        Headers: {
          "Content-Type":"application/json"
        }
      };
      const data = await axios.post("http://localhost:5000/api/user",{Name,Email,Password,Pic},config)
      toaster.create({
        title:"Succesfull Registration",
        type:'success'
      });
      localStorage.setItem('userInfo',JSON.stringify(data));
    setLoading(false)
    history.push("/chats")
    } catch (error) {
      toaster.create({
        title:"Error Occured!",
        description:error.response.data.message,
        type:'error'
      });
      setLoading(false)
    }
  }
  const isError = ConfirmPassword !== "" && Password !== ConfirmPassword;
  return (
    <VStack gap="5">
      
      <Field.Root id='Name' required>
        
        <Field.Label>Name
          <FieldRequiredIndicator/>
        </Field.Label>
        
        <Input 
          placeholder="Enter Your Name" 
          onChange={(e) => SetName(e.target.value)} 
        />
      </Field.Root>
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
              placeholder="Create Your Password" 
              onChange={(e) => SetPassword(e.target.value)} 
            />
            
          </InputGroup>
      </Field.Root>
      <Field.Root id='ConfirmPassword' required invalid={isError}>
        
        <Field.Label>Confirm Password
          <FieldRequiredIndicator/>
        </Field.Label>
        <InputGroup flex='1' width='50%' endElement={ <Button bg='white' type='subtle' h='1.75rem' size='sm' onClick={togglePassword} variant='ghost'>
              {Show ? "Hide": "Show"}
            </Button> }>
        
            <Input type={Show ? "text":"password"}
              placeholder="Confirm Your Password" 
              onChange={(e) => SetConfirmPassword(e.target.value)} 
            />
            
          </InputGroup>
          {isError && (<Field.ErrorText color="red.500">Passwords do not match</Field.ErrorText>)}
      </Field.Root>
      <Field.Root id='Pic' required>
        
        <Field.Label>Upload Your Photo
          <FieldRequiredIndicator/>
        </Field.Label>
        
        <Input 
          type='file' 
          p={'1.5'}
          accept='image/*'
          onChange={(e) => postDetails(e.target.files[0])} 
        />
      </Field.Root>
      <Button disabled={isError || !Password || !ConfirmPassword} colorPalette={"blue"} bg={'blue'} colorScheme={"blue"} width={"100%"} style={{marginTop: 15}} onClick={submitHandler} loading={loading} >SignUp</Button>
    </VStack>
  );
}

export default SignUp;*/
import React, { useState } from 'react';
import { VStack, Field, Input, FieldRequiredIndicator, InputGroup, Button } from '@chakra-ui/react';
import { toaster } from '../ui/toaster';
import axios from 'axios';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';

const SignUp = () => {
  const [Name, SetName] = useState()
  const [Email, SetEmail] = useState()
  const [Password, SetPassword] = useState("")
  const [ConfirmPassword, SetConfirmPassword] = useState("")
  const [Pic, setPic] = useState()
  const [Show, setShow] = useState(false)
  const [loading, setLoading] = useState(false);
  const togglePassword = () => setShow(!Show)
  const history = useHistory()

  const postDetails = (pics) => {
    setLoading(true)
    if (pics === undefined) {
      toaster.create({ title: 'Please select an image', type: "warning" })
      setLoading(false);
      return;
    }
    if (pics.type === "image/jpeg" || pics.type === "image/png" || pics.type === "image/jpg") {
      const data = new FormData()
      data.append("file", pics)
      data.append("upload_preset", "Me-2-U")
      data.append("cloud_name", "dvzjchtyc")
      fetch("https://api.cloudinary.com/v1_1/dvzjchtyc/image/upload", {
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setPic(data.url.toString())
          setLoading(false)
        })
        .catch((err) => {
          console.log(err);
          setLoading(false)
        });
    } else {
      toaster.create({ title: "Please select a valid image (jpeg/png/jpg)", type: "warning" })
      setLoading(false)
    }
  }

  const submitHandler = async () => {
    setLoading(true);

    if (!Name || !Email || !Password || !ConfirmPassword) {
      toaster.create({ title: "Please fill all the fields", type: "warning" });
      setLoading(false)
      return;
    }

    if (Password !== ConfirmPassword) {
      toaster.create({ title: "Passwords do not match", type: "warning" });
      setLoading(false)
      return;
    }

    try {
      const config = {
        headers: {                          
          "Content-Type": "application/json"
        }
      };

      const { data } = await axios.post(
        "http://localhost:5000/api/user",
        { Name, Email, Password, Pic },
        config
      );

  
      toaster.create({
        title: "Registration Successful!",
        description: data.message, 
        type: "success",
        duration: 6000,
      });

      setLoading(false)

  
      setTimeout(() => {
        history.push("/")
      }, 2000);

    } catch (error) {
      toaster.create({
        title: "Error Occurred!",
        description: error.response?.data?.message || "Something went wrong",
        type: "error",
      });
      setLoading(false)
    }
  }

  const isError = ConfirmPassword !== "" && Password !== ConfirmPassword;

  return (
    <VStack gap="5">
      <Field.Root id='Name' required>
        <Field.Label>Name <FieldRequiredIndicator /></Field.Label>
        <Input placeholder="Enter Your Name" onChange={(e) => SetName(e.target.value)} />
      </Field.Root>

      <Field.Root id='Email' required>
        <Field.Label>Email <FieldRequiredIndicator /></Field.Label>
        <Input placeholder="Enter Your Email" onChange={(e) => SetEmail(e.target.value)} />
      </Field.Root>

      <Field.Root id='Password' required>
        <Field.Label>Password <FieldRequiredIndicator /></Field.Label>
        <InputGroup flex='1' width='50%' endElement={
          <Button bg='white' type='subtle' h='1.75rem' size='sm' onClick={togglePassword} variant='ghost'>
            {Show ? "Hide" : "Show"}
          </Button>
        }>
          <Input
            type={Show ? "text" : "password"}
            placeholder="Create Your Password"
            onChange={(e) => SetPassword(e.target.value)}
          />
        </InputGroup>
      </Field.Root>

      <Field.Root id='ConfirmPassword' required invalid={isError}>
        <Field.Label>Confirm Password <FieldRequiredIndicator /></Field.Label>
        <InputGroup flex='1' width='50%' endElement={
          <Button bg='white' type='subtle' h='1.75rem' size='sm' onClick={togglePassword} variant='ghost'>
            {Show ? "Hide" : "Show"}
          </Button>
        }>
          <Input
            type={Show ? "text" : "password"}
            placeholder="Confirm Your Password"
            onChange={(e) => SetConfirmPassword(e.target.value)}
          />
        </InputGroup>
        {isError && <Field.ErrorText color="red.500">Passwords do not match</Field.ErrorText>}
      </Field.Root>

      <Field.Root id='Pic' required>
        <Field.Label>Upload Your Photo <FieldRequiredIndicator /></Field.Label>
        <Input
          type='file'
          p={'1.5'}
          accept='image/*'
          onChange={(e) => postDetails(e.target.files[0])}
        />
      </Field.Root>

      <Button
        disabled={isError || !Password || !ConfirmPassword}
        colorPalette={"blue"}
        bg={'blue'}
        width={"100%"}
        style={{ marginTop: 15 }}
        onClick={submitHandler}
        loading={loading}
      >
        Sign Up
      </Button>
    </VStack>
  );
}

export default SignUp;
