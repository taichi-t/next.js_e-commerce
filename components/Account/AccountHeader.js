import React, { useState, useContext, useRef } from 'react';
import {
  Header,
  Icon,
  Segment,
  Loader,
  Label,
  Image,
  Form,
  Button,
  Input,
  Modal,
} from 'semantic-ui-react';
import ModalForm from '../Modal/ModalForm';
import formatDate from '../../utils/formatDate';
import baseUrl from '../../utils/baseUrl';
import cookie from 'js-cookie';
import axios from 'axios';
import catchErrors from '../../utils/catchErrors';
import { UserContext } from '../../utils/UserProvider';
import Skeleton from 'react-loading-skeleton';

function AccountHeader() {
  const { user, setUser, loading: userLoading } = useContext(UserContext);
  const { role, email, name, createdAt, profilePicture } = user;
  const [open, setOpen] = React.useState(false);
  const [media, setMedia] = useState();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  function handleChange(e) {
    const { files } = e.target;
    setMedia(files);
  }

  async function handleSubmit(e) {
    try {
      e.preventDefault();
      setLoading(true);
      setError('');
      setOpen(false);
      const token = cookie.get('token');
      const formData = new FormData();
      formData.append('file', media[0]);
      formData.append('profilePicturePublicId', profilePicture.publicId);

      const headers = {
        headers: {
          Authorization: token,
          'content-type': 'multipart/form-data',
        },
      };
      const url = `${baseUrl}/api/account`;
      const { data: newProfilePicture } = await axios.post(
        url,
        formData,
        headers
      );

      setLoading(false);
      setUser({ ...user, profilePicture: newProfilePicture });
      setSuccess(true);
    } catch (error) {
      catchErrors(error, setError);
      console.error('ERROR!', error);
    } finally {
      setLoading(false);
    }
  }

  const modalFormComponent = (
    <>
      <Header>Please choose a image</Header>
      <Modal.Content>
        <Form onSubmit={handleSubmit}>
          <input
            ref={fileInputRef}
            type="file"
            name="media"
            label="Media"
            accept="image/*"
            onChange={handleChange}
            className="uploader"
          />

          <Button
            content="Choose File"
            labelPosition="left"
            icon="file"
            form="myForm"
            onClick={() => fileInputRef.current.click()}
            style={{ marginBottom: '1em' }}
          />
          <span>{media && media[0].name}</span>
          <Modal.Actions>
            <Button color="black" onClick={() => setOpen(false)} id="myForm">
              Cancel
            </Button>
            <Form.Field
              control={Button}
              color="blue"
              icon="cloud upload"
              content="Upload"
              type="submit"
              as="span"
            />
          </Modal.Actions>
        </Form>
      </Modal.Content>
    </>
  );
  return (
    <>
      {userLoading ? (
        <Skeleton height={330} />
      ) : (
        <Segment secondary inverted color="violet" loading={loading}>
          <Label
            color="teal"
            size="large"
            ribbon
            icon="privacy"
            style={{ textTramsform: 'capitalize' }}
            content={role}
          />
          <Header inverted textAlign="center" as="h1" icon>
            <Header.Content>
              <div className="profile-container">
                <Image
                  src={
                    (profilePicture && profilePicture.url) ||
                    'images/anonymous-user.png'
                  }
                  circular
                  wrapped
                  size="small"
                  className="profile-image"
                />

                <ModalForm
                  trigger={
                    <Icon
                      name="camera"
                      className="profile-icon"
                      color="grey"
                      inverted
                      circular
                    />
                  }
                  component={modalFormComponent}
                  setOpen={setOpen}
                  open={open}
                />
              </div>
            </Header.Content>
            <Header.Content>{name}</Header.Content>
            <Header.Subheader>{email}</Header.Subheader>
            <Header.Subheader>Joined {formatDate(createdAt)}</Header.Subheader>
          </Header>
        </Segment>
      )}
    </>
  );
}

export async function getStaticProps() {
  return {
    props: {
      cloudinaryUrl: process.env.CLOUDINARY_URL,
    },
  };
}

export default AccountHeader;
