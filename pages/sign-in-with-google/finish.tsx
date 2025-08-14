import { GetServerSideProps } from "next";

interface MobileFinishProps {
  token: string;
}

export default function MobileFinish({ token }: MobileFinishProps) {
  // 2) 用深链回到 App（或用 Universal Link）
  return (
    <html>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.location = "chattykitty://google-oauth-finish?token=${token}";
              setTimeout(()=>{ window.close?.(); }, 1000);
            `,
          }}
        />
        <p>Returning to App...</p>
      </body>
    </html>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  try {
    // 1) 生成一次性 code（存在 DB/Redis）
    const cookieHeader = req.headers.cookie || "";

    const res = await fetch(
      "http://localhost:3000/api/google/session-handoff",
      {
        method: "POST",
        headers: {
          cookie: cookieHeader, // 让后端识别当前站点会话
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to get handoff code: ${res.status}`);
    }

    const { token } = await res.json();

    return {
      props: {
        token,
      },
    };
  } catch (error) {
    console.error("Error in getServerSideProps:", error);

    // 返回错误页面或重定向
    return {
      props: {
        code: "error",
      },
    };
  }
};
