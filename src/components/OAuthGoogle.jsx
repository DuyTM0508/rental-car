import { GooglePlusOutlined } from "@ant-design/icons";
import { Button } from "antd";
import axios from "axios";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { app } from "../../firebase";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useUserState } from "@/recoils/user.state.js";
import styled from "@emotion/styled";

const StyledButton = styled(Button)`
  position: relative;
  width: 100%;
  height: 50px;
  font-size: 16px;
  font-weight: 500;
  color: #4285f4;
  background-color: white;
  border: 1px solid #dadce0;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease-in-out;

  &:hover,
  &:focus {
    background-color: #f8faff;
    border-color: #4285f4;
    color: #4285f4;
  }

  .anticon {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 20px;
    color: #4285f4;
  }
`;

function OAuthGoogle() {
  const router = useRouter();
  const [, setUser] = useUserState();
  const [, setAccessToken] = useLocalStorage("access_token");

  const handleGoogleAuthClick = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const auth = getAuth(app);

      const result = await signInWithPopup(auth, provider);

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_REACT_APP_BACKEND_URL}/users/google`,
        {
          fullname: result.user.displayName,
          email: result.user.email,
          photo: result.user.photoURL,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (res.status === 200) {
        setUser({ ...res.data });
        setAccessToken(res.data.access_token);

        if (res.data.result.role === "user") {
          router.push("/");
        } else {
          router.push("/admin/dashboard");
        }
      } else {
        console.error(res.data.errors[0].msg);
        toast.error("Google authentication failed", {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred during Google authentication", {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  };

  return (
    <StyledButton onClick={handleGoogleAuthClick} icon={<GooglePlusOutlined />}>
      Sign in with Google
    </StyledButton>
  );
}

export default OAuthGoogle;
