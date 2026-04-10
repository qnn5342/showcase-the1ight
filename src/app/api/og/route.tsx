import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const COLORS = {
  bg: "#15333B",
  card: "#214C54",
  accent: "#FFD94C",
  text: "#F0F0F0",
  heading: "#FDF5DA",
  muted: "#A0B8BC",
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "landing";

  if (type === "project") {
    const title = searchParams.get("title") ?? "Dự án";
    const author = searchParams.get("author") ?? "";
    const cover = searchParams.get("cover") ?? "";

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "1200px",
            height: "630px",
            backgroundColor: COLORS.bg,
            fontFamily: "sans-serif",
          }}
        >
          {/* Left: cover image */}
          {cover ? (
            <div
              style={{
                display: "flex",
                width: "600px",
                height: "630px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cover}
                alt=""
                style={{
                  width: "600px",
                  height: "630px",
                  objectFit: "cover",
                }}
              />
              {/* Fade gradient right */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: "200px",
                  height: "630px",
                  background: `linear-gradient(to right, transparent, ${COLORS.bg})`,
                }}
              />
            </div>
          ) : null}

          {/* Right: text content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "60px 56px",
              flex: 1,
              gap: "16px",
            }}
          >
            {/* Brand mark */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "8px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "32px",
                  height: "32px",
                  backgroundColor: COLORS.accent,
                  borderRadius: "6px",
                  fontWeight: 900,
                  fontSize: "20px",
                  color: COLORS.bg,
                }}
              >
                1
              </div>
              <span
                style={{
                  color: COLORS.muted,
                  fontSize: "14px",
                  letterSpacing: "0.05em",
                }}
              >
                THE1IGHT SHOWCASE
              </span>
            </div>

            {/* Title */}
            <div
              style={{
                color: COLORS.heading,
                fontSize: "40px",
                fontWeight: 700,
                lineHeight: 1.2,
              }}
            >
              {title}
            </div>

            {/* Author */}
            {author ? (
              <div
                style={{
                  color: COLORS.text,
                  fontSize: "20px",
                }}
              >
                bởi {author}
              </div>
            ) : null}

            {/* URL badge */}
            <div
              style={{
                display: "flex",
                marginTop: "auto",
                backgroundColor: COLORS.card,
                borderRadius: "8px",
                padding: "8px 16px",
                color: COLORS.accent,
                fontSize: "14px",
                width: "fit-content",
              }}
            >
              showcase.the1ight.com
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  if (type === "profile") {
    const title = searchParams.get("title") ?? "Member";
    const avatar = searchParams.get("avatar") ?? "";
    const projectCount = searchParams.get("projectCount") ?? "0";

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "1200px",
            height: "630px",
            backgroundColor: COLORS.bg,
            fontFamily: "sans-serif",
            gap: "24px",
          }}
        >
          {/* Brand mark top */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              position: "absolute",
              top: "40px",
              left: "56px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "32px",
                height: "32px",
                backgroundColor: COLORS.accent,
                borderRadius: "6px",
                fontWeight: 900,
                fontSize: "20px",
                color: COLORS.bg,
              }}
            >
              1
            </div>
            <span
              style={{
                color: COLORS.muted,
                fontSize: "14px",
                letterSpacing: "0.05em",
              }}
            >
              THE1IGHT SHOWCASE
            </span>
          </div>

          {/* Avatar */}
          <div
            style={{
              display: "flex",
              width: "140px",
              height: "140px",
              borderRadius: "70px",
              border: `4px solid ${COLORS.accent}`,
              overflow: "hidden",
              backgroundColor: COLORS.card,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatar}
                alt=""
                style={{ width: "140px", height: "140px", objectFit: "cover" }}
              />
            ) : (
              <span style={{ color: COLORS.accent, fontSize: "56px", fontWeight: 700 }}>
                {title.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* Display name */}
          <div
            style={{
              color: COLORS.heading,
              fontSize: "48px",
              fontWeight: 700,
            }}
          >
            {title}
          </div>

          {/* Project count badge */}
          <div
            style={{
              display: "flex",
              backgroundColor: COLORS.card,
              borderRadius: "99px",
              padding: "10px 24px",
              color: COLORS.accent,
              fontSize: "20px",
              fontWeight: 600,
            }}
          >
            📦 {projectCount} dự án
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  // Default: landing
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "1200px",
          height: "630px",
          backgroundColor: COLORS.bg,
          fontFamily: "sans-serif",
          gap: "24px",
        }}
      >
        {/* Logo mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "80px",
            height: "80px",
            backgroundColor: COLORS.accent,
            borderRadius: "16px",
            fontWeight: 900,
            fontSize: "48px",
            color: COLORS.bg,
          }}
        >
          1
        </div>

        {/* Heading */}
        <div
          style={{
            color: COLORS.heading,
            fontSize: "56px",
            fontWeight: 800,
            letterSpacing: "-0.02em",
          }}
        >
          The1ight Showcase
        </div>

        {/* Subtitle */}
        <div
          style={{
            color: COLORS.text,
            fontSize: "24px",
            textAlign: "center",
            maxWidth: "700px",
          }}
        >
          Nơi học viên vibe code khoe sản phẩm thật
        </div>

        {/* URL badge */}
        <div
          style={{
            display: "flex",
            backgroundColor: COLORS.card,
            borderRadius: "8px",
            padding: "10px 20px",
            color: COLORS.accent,
            fontSize: "16px",
            marginTop: "8px",
          }}
        >
          showcase.the1ight.com
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
