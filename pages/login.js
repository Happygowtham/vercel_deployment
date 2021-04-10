import React, {useState} from 'react';
import Router from 'next/router';
import cookie from 'js-cookie';
import Head from 'next/head'

const Login = () => {
  const [loginError, setLoginError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    //call api
    fetch('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })
      .then((r) => {
        return r.json();
      })
      .then((data) => {
        if (data && data.error) {
          setLoginError(data.message);
        }
        if (data && data.token) {
          //set cookie
          cookie.set('token', data.token, {expires: 2});
          Router.push('/');
        }
      });
  }

  return (
    <form onSubmit={handleSubmit}>
      <p><b>Login</b></p>
      <label htmlFor="email">
        Email
      <input
        name="email"
        type="email"
        required="true"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      </label>

      <br />
      <label htmlFor="password">
        Password
      <input
        name="password"
        type="password"
        required="true"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      </label>
      <br />
      <input type="submit" value="Login" />
      {loginError && <p style={{color: 'red'}}>{loginError}</p>}
    </form>
  );
};

export default Login;
