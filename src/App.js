import logo from "./logo.svg";
import "./App.scss";
import { RadioBrowserApi, StationSearchType } from "radio-browser-api";
import { useEffect, useRef, useState } from "react";
import AudioPlayer from "react-h5-audio-player";

const api = new RadioBrowserApi("Radio-test");

function App() {
  const [stationsList, setStationList] = useState([]);
  const [currentPlayingStationList, setCurrentPlayingStationList] = useState(
    []
  );
  // const [isInputValid, setIsInputVaild] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const playerRefs = useRef([]);

  useEffect(() => {
    // playerRefs 초기화
    playerRefs.current = playerRefs.current.slice(0, stationsList.length);
  }, [stationsList]);

  const checkInputValidation = (e) => {
    const inputValue = e.target.value;

    // 정규식으로 콤마, 띄어쓰기, 숫자 외의 문자들을 제거
    const sanitizedValue = inputValue.replace(/[^0-9,]/g, "");

    setInputValue(sanitizedValue);
  };

  const handleAudioError = (index) => {
    setStationList((prevStations) => {
      const newStations = [...prevStations];
      newStations[index].hasError = true;
      return newStations;
    });
  };

  const getStations = async () => {
    try {
      const stations = await api.searchStations({
        countryCode: "US",
        limit: 100,
      });
      setStationList(stations);
    } catch (e) {
      setIsError(true);
    }
  };

  const playAllStation = () => {
    const allPlayersArray = playerRefs.current;

    allPlayersArray.forEach((currentPlayer) => {
      // 변경된 부분
      if (currentPlayer && currentPlayer.audio && currentPlayer.audio.current) {
        currentPlayer.audio.current.play();
      }
    });
  };

  const pauseAllStation = () => {
    const allPlayersArray = playerRefs.current;

    allPlayersArray.forEach((currentPlayer) => {
      if (currentPlayer && currentPlayer.audio && currentPlayer.audio.current) {
        currentPlayer.audio.current.pause();
      }
    });
  };

  const handlePlaySelected = () => {
    // inputValue를 배열로 변환 (예: "1,2,3" => [1, 2, 3])
    const indices = inputValue
      .split(",")
      .map((str) => parseInt(str.trim()) - 1)
      .filter((num) => !isNaN(num)); // 숫자만 포함

    indices.forEach((index) => {
      const player = playerRefs.current[index];
      if (player && player.audio && player.audio.current) {
        player.audio.current.play();
      }
    });
  };

  useEffect(() => {
    getStations();
  }, []);

  useEffect(() => {
    console.log(stationsList);
  }, [stationsList]);

  return (
    <div className="App">
      <div className="controller">
        <div className="controller__container">
          <button
            className="all-play-button"
            onClick={(e) => {
              playAllStation();
            }}
          >
            전체 on
          </button>
          <button
            className="all-play-button"
            onClick={(e) => {
              pauseAllStation();
            }}
          >
            전체 off
          </button>
          <input
            type="text"
            onChange={checkInputValidation}
            value={inputValue}
          />
          <button onClick={handlePlaySelected}>선택한 라디오 on</button>
          <ul>
            {currentPlayingStationList.map((iten, index) => (
              <li>sadf</li>
            ))}
          </ul>
        </div>
        <span className="input-validation-message">
          숫자는 콤마(,) 기호로 구분해주세요.
        </span>
      </div>
      <main>
        {isError ? (
          <h1>
            데이터를 가져오는 동안 문제가 발생하였습니다. 새로고침 해주세요.
          </h1>
        ) : (
          stationsList.map((item, index) => {
            if (item.hasError) {
              return null;
            }

            return (
              <li className="station" id={`station-${index}`}>
                <span className="station__index">{index + 1}</span>
                <span>{item.name}</span>
                <AudioPlayer
                  ref={(el) => (playerRefs.current[index] = el)}
                  className="player"
                  src={item.urlResolved}
                  showJumpControls={false}
                  layout="stacked"
                  customProgressBarSection={[]}
                  customControlsSection={["MAIN_CONTROLS", "VOLUME_CONTROLS"]}
                  autoPlayAfterSrcChange={false}
                  onError={(e) => {
                    handleAudioError(index);
                  }}
                />
              </li>
            );
          })
        )}
      </main>
    </div>
  );
}

export default App;
