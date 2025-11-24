import React from "react";
import { GetServerSideProps } from "next";

function Index() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: "/login",
    permanent: false,
  },
});

export default Index;
