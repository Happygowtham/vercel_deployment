import React, {useState} from 'react';
import Router from 'next/router';
import cookie from 'js-cookie';
import Head from 'next/head'

const post = () => {
  const [loginError, setLoginError] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    //call api
    fetch('/api/auth_post', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        description,
      }),
    })
      .then((r) => 
      {
        return r.json('');
      })
  }

  return (
    <form onSubmit={handleSubmit}>
      <p><b>Post Your Comment</b></p>
      <label htmlFor="title">
        Title
      <input
        name="title"
        type="text"
        required="true"
      />
      </label>

      <br />
      <label htmlFor="description">
        Description
      <input
        name="description"
        type="text"
        required="true"

      />
      </label>
      <br />
      <input type="submit" value="Post" />
      {loginError && <p style={{color: 'red'}}>{loginError}</p>}
    </form>
  );
};

export default post;
