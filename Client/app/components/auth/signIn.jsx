"use client";

import { signIn, useSession } from "next-auth/react";
import { useState } from "react";
import "../../styles/admin.css";

const SignIn = () => {
  const [error, setError] = useState(null);
  const { data: session, status: loading } = useSession();

  const handleSignIn = async (e) => {
    e.preventDefault();
    const { email, password } = e.target.elements;
    const result = await signIn("credentials", {
      redirect: false,
      email: email.value,
      password: password.value,
    });

    if (!result.error) {
      window.location.href = "/dashboard";
    } else {
      alert("Failed to login");
      console.error(result.error);
      setError(result.error);
    }
    if (loading) return <p>Loading...</p>;
  };

  return (
    <>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-10 col-lg-12 col-md-9">
            {error && <p style={{ color: "red" }}>{error}</p>}
            <div className="card o-hidden border-0 shadow-lg my-5">
              <div className="card-body p-0">
                <div className="row">
                  <div className="col-lg-6 d-none d-lg-block bg-login-image"></div>
                  <div className="col-lg-6">
                    <div className="p-5">
                      <div className="text-center">
                        <h1 className="h4 text-gray-900 mb-4">
                          Omega Admin Dashboard
                        </h1>
                      </div>
                      <form className="user" onSubmit={handleSignIn}>
                        <div className="form-group">
                          <input
                            type="email"
                            className="form-control form-control-user"
                            id="exampleInputEmail"
                            aria-describedby="emailHelp"
                            placeholder="Enter Email Address..."
                            name="email"
                          />
                        </div>
                        <div className="form-group">
                          <input
                            type="password"
                            className="form-control form-control-user"
                            id="exampleInputPassword"
                            placeholder="Password"
                            name="password"
                          />
                        </div>
                        <div className="form-group">
                          <div className="custom-control custom-checkbox small">
                            <input
                              type="checkbox"
                              className="custom-control-input"
                              id="customCheck"
                            />
                            <label
                              className="custom-control-label"
                              for="customCheck">
                              Remember Me
                            </label>
                          </div>
                        </div>
                        <button
                          type="submit"
                          className="btn btn-primary btn-user btn-block">
                          Login
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignIn;
