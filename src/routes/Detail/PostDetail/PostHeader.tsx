import { CONFIG } from "site.config";
import Tag from "src/components/Tag";
import { TPost } from "src/types";
import { formatDate } from "src/libs/utils";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import { colors } from "src/styles";
import IonIcon from '@reacticons/ionicons';

type Props = {
  data: TPost;
};

const PostHeader: React.FC<Props> = ({ data }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingTTS, setIsLoadingTTS] = useState(false);
  const [readingTime, setReadingTime] = useState<String>("");
  const content = useRef<String | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const nextAudioRef = useRef<HTMLAudioElement | null>(null);
  const controllerRef = useRef<AbortController | null>(null);


  useEffect(() => {
    console.log()
    // 단어 수 계산
    const text = data.title + "\n" + (document.querySelector("main.notion") as HTMLElement)?.innerText;
    content.current = text
      // 이미지 제거
      .replace(/!\[([^\]]+?)\]\([^)]+?\)/g, '')
      // 링크는 텍스트만 남기고 제거
      .replace(/\[([^\]]+?)\]\([^)]+?\)/g, '$1')
      // 코드 블록 제거
      .replace(/```[^\n]+?\n([\s\S]+?)\n```/g, '')
      // 불렛 제거
      .replace(/- ([^\n]+?)\n/g, '$1\n')
      // 특수문자 제거
      .replace(/([*_`~#>])/g, '')
      // 좌우 공백 제거
      .trim();

    let cntWord = content.current?.split(" ").length || 0;
    // 읽기 시간
    const readWPM = 200;
    let readMinute = Math.trunc(cntWord / readWPM);
    let readSecond = Math.round((cntWord / readWPM - readMinute) * 60 / 10) * 10;
    if (readSecond === 60) { readSecond = 0; readMinute += 1; }
    setReadingTime(readMinute + "분");
  }, []);


  async function TTS(): Promise<void> {
    if (isPlaying) {
      controllerRef.current?.abort();
      currentAudioRef.current?.pause();
      nextAudioRef.current?.pause();
      currentAudioRef.current = null;
      nextAudioRef.current = null;
      setIsPlaying(false);
      setIsLoadingTTS(false);
      return;
    }

    setIsLoadingTTS(true);

    controllerRef.current = new AbortController();
    const text = content.current || "";
    const paragraphs = text.split("\n").filter(p => p && p.length > 1);

    for (let i = 0; i < paragraphs.length; i++) {
      try {
        console.log(paragraphs[i]);
        await playParagraph(paragraphs[i], i < paragraphs.length - 1 ? paragraphs[i + 1] : null, controllerRef.current.signal);
      } catch (error: any) {
        if (error.name === "AbortError") {
          console.log("Fetch request has been aborted");
          break;
        } else {
          console.error(error);
        }
      }
    }

    setIsPlaying(false);
  }

  async function playParagraph(currentText: string, nextText: string | null, signal: AbortSignal): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        if (!currentAudioRef.current) {
          currentAudioRef.current = await createAudioElement(currentText, signal);
        }

        if (nextText && !nextAudioRef.current) {
          nextAudioRef.current = await createAudioElement(nextText, signal);
        }

        setIsLoadingTTS(false);

        currentAudioRef.current.onplay = () => setIsPlaying(true);
        currentAudioRef.current.onended = () => {
          if (nextAudioRef.current) {
            currentAudioRef.current = nextAudioRef.current;
            nextAudioRef.current = null;
            currentAudioRef.current.play();
          }
          resolve();
        };

        await currentAudioRef.current.play();
      } catch (error: any) {
        reject(error);
      }
    });
  }

  async function createAudioElement(text: string, signal: AbortSignal): Promise<HTMLAudioElement> {
    const options: Object = {
      method: "POST",
      headers: {
        "xi-api-key": process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 1,
          similarity_boost: 1,
        },
      }),
      signal,
    };

    const response = await fetch("https://api.elevenlabs.io/v1/text-to-speech/6WKnjxyhfi8k86ffrkFz/stream", options);
    const audio = await response.blob();
    const audioURL = URL.createObjectURL(audio);
    return new Audio(audioURL);
  }

  return (
    <StyledWrapper>
      <h1 className="title">{data.title}</h1>
      <button onClick={() => TTS()} className="tts-btn" style={{ '--content': isPlaying ? '"그만 듣기"' : (isLoadingTTS ? '"로딩 중"' : '"음성으로 듣기"') } as React.CSSProperties}>
        {isPlaying ? <IonIcon name="pause" /> : (isLoadingTTS ? <IonIcon name="ellipsis-horizontal" /> : <IonIcon name="barcode-outline" />)}
      </button>
      {data.type[0] !== "Paper" && (
        <nav>
          <div className="top">
            {data.author && data.author[0] && data.author[0].name && (
              <>
                <div className="author">
                  <Image
                    css={{ borderRadius: "50%" }}
                    src={data.author[0].profile_photo || CONFIG.profile.image}
                    alt="profile_photo"
                    width={24}
                    height={24}
                  />
                  <div className="">{data.author[0].name}</div>
                </div>
                <div className="hr"></div>
              </>
            )}
            <div className="date">
              {formatDate(data?.date?.start_date || data.createdTime, CONFIG.lang).trim()}
            </div>
            <div className="hr" style={{ marginLeft: '-10px' }}></div>
            <div className="date">
              읽는 데 {readingTime} 소요
            </div>
          </div>
          <div className="mid">
            {data.tags && (
              <div className="tags">
                {data.tags.map((tag: string) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
            )}
          </div>
          {data.thumbnail && (
            <div className="thumbnail">
              <Image src={data.thumbnail} css={{ objectFit: "cover" }} fill alt={data.title} />
            </div>
          )}
        </nav>
      )}
      <style jsx>{`
.tts-btn {
  position: fixed;
  bottom: 40px;
  right: 30px;
  background: ${colors.dark.indigo1};
  box-shadow: 0 2px 10px ${colors.dark.indigo1};
  color: #eee;
  padding: 10px;
  font-size: 30px;
  border-radius: 50%;
  display: flex;
  justify-items: center;
  align-items: center;
  z-index: 99;
}

.tts-btn:hover {
border-radius: 15px;
  }

.tts-btn:hover::after {
font-size: 15px;
margin-left: 10px;
content: var(--content);
  }
      `}</style>
    </StyledWrapper>
  );
};

export default PostHeader;

const StyledWrapper = styled.div`
  .title {
    font-size: 1.875rem;
    line-height: 2.25rem;
    font-weight: 700;
  }
  nav {
    margin-top: 1.5rem;
    color: ${({ theme }) => theme.colors.gray11};
    > .top {
      display: flex;
      margin-bottom: 0.75rem;
      gap: 0.75rem;
      align-items: center;
      .author {
        display: flex;
        gap: 0.5rem;
        align-items: center;
      }
      .hr {
        margin-top: 0.25rem;
        margin-bottom: 0.25rem;
        align-self: stretch;
        width: 1px;
        background-color: ${({ theme }) => theme.colors.gray10};
      }
      .date {
        margin-right: 0.5rem;

        @media (min-width: 768px) {
          margin-left: 0;
        }
      }
    }
    > .mid {
      display: flex;
      margin-bottom: 1rem;
      align-items: center;
      .tags {
        display: flex;
        overflow-x: auto;
        flex-wrap: nowrap;
        gap: 0.5rem;
        max-width: 100%;
      }
    }
    .thumbnail {
      overflow: hidden;
      position: relative;
      margin-bottom: 1.75rem;
      border-radius: 1.5rem;
      width: 100%;
      background-color: ${({ theme }) => theme.colors.gray4};
      padding-bottom: 66%;

      @media (min-width: 1024px) {
        padding-bottom: 50%;
      }
    }
  }
`;
