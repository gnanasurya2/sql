import fs from "fs";
import matter from "gray-matter";
import { MDXRemote } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import dynamic from "next/dynamic";
import Head from "next/head";
import Link from "next/link";
import path from "path";
import CustomLink from "../../components/CustomLink";
import Layout from "../../components/Layout";
import { postFilePaths, POSTS_PATH } from "../../utils/mdxUtils";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-sql";
import "prismjs/themes/prism-funky.css";
import Table from "../../components/Table";
import { useEffect, useState } from "react";
import styles from "../../css/App.module.css";
// Custom components/renderers to pass to MDX.
// Since the MDX files aren't loaded by webpack, they have no knowledge of how
// to handle import statements. Instead, you must include components in scope
// here.
const components = {
  a: CustomLink,
  // It also works with dynamically-imported components, which is especially
  // useful for conditionally loading components for certain routes.
  // See the notes in README.md for more details.
  TestComponent: dynamic(() => import("../../components/TestComponent")),
  Head,
};

export default function PostPage({ source, frontMatter }) {
  const [codeString, setCodeString] = useState("");
  const [tableData, setTableData] = useState(null);
  useEffect(() => console.log("table data", tableData), [tableData]);
  const executeSql = () => {
    const db = openDatabase("mydb", "1.0", "My DB", 2 * 1024 * 1024);
    db.transaction(function (tx) {
      codeString.split("\n").forEach((line) => {
        tx.executeSql(
          line,
          [],
          (success, data) => {
            console.log("asdqw", success, data.rows, data.rows.length, data);
            setTableData({ ...data.rows });
          },
          (success, error) => console.log("error", success, error)
        );
      });
    });
    setCodeString("");
  };
  return (
    <div>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div className={styles.App}>
        <div className={`${styles.child} ${styles.blog}`}>
          <MDXRemote {...source} components={components} />
        </div>
        <div className={`${styles.child} ${styles.vertical}`}>
          <div className={`${styles.child} ${styles.vertical}`}>
            <Editor
              value={codeString}
              onValueChange={(code) => setCodeString(code)}
              highlight={(code) => highlight(code, languages.sql)}
              padding={10}
              style={{
                fontSize: 16,
                backgroundColor: "#0e141b",
                flex: 1,
                caretColor: "white",
                color: "white",
                margin: "10px",
                borderRadius: "12px",
                marginLeft: "0px",
              }}
            />
            <button onClick={executeSql}>executeSql</button>
          </div>
          <div className={styles.child}>
            <Table data={tableData} />
          </div>
        </div>
      </div>
    </div>
  );
}

export const getStaticProps = async ({ params }) => {
  const postFilePath = path.join(POSTS_PATH, `${params.slug}.mdx`);
  const source = fs.readFileSync(postFilePath);

  const { content, data } = matter(source);

  const mdxSource = await serialize(content, {
    // Optionally pass remark/rehype plugins
    mdxOptions: {
      remarkPlugins: [],
      rehypePlugins: [],
    },
    scope: data,
  });

  return {
    props: {
      source: mdxSource,
      frontMatter: data,
    },
  };
};

export const getStaticPaths = async () => {
  const paths = postFilePaths
    // Remove file extensions for page paths
    .map((path) => path.replace(/\.mdx?$/, ""))
    // Map the path into the static paths object required by Next.js
    .map((slug) => ({ params: { slug } }));

  return {
    paths,
    fallback: false,
  };
};
