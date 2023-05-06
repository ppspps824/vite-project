import * as posenet from "@tensorflow-models/posenet";
import * as tf from "@tensorflow/tfjs";
import { useEffect, useRef, useState } from "react";
import Countdown from "react-countdown";
import Webcam from "react-webcam";
import "./App.css";

const videoConstraints = {
  width: 720,
  height: 360,
  facingMode: "user",
};

function App() {
  const [countdownKey, setCountdownKey] = useState(0);
  const [countdownCompleted, setCountdownCompleted] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [model, setModel] = useState<posenet.PoseNet | null>(null);

  useEffect(() => {
    const loadModel = async () => {
      tf.setBackend("webgl");
      const poseNetModel = await posenet.load();
      setModel(poseNetModel);
    };
    loadModel();
  }, []);

  const capture = async () => {
    setCountdownCompleted(true);
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc && model && canvasRef.current) {
      const pose = await estimatePose(imageSrc, model);
      drawPose(canvasRef.current, pose);
    }
    setTimeout(() => {
      setCountdownKey((prevKey) => prevKey + 1);
      setCountdownCompleted(false);
    }, 1000);
  };

  const estimatePose = async (imageSrc: string, model: posenet.PoseNet) => {
    return new Promise<posenet.Pose>((resolve) => {
      const img = new Image();
      img.src = imageSrc;
      img.onload = async () => {
        const pose = await model.estimateSinglePose(img);
        resolve(pose);
      };
    });
  };

  const drawPose = (canvas: HTMLCanvasElement, pose: posenet.Pose) => {
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const skeleton = [
        [0, 5],
        [0, 6],
        [5, 7],
        [7, 9],
        [6, 8],
        [8, 10],
        [11, 12],
        [5, 11],
        [11, 13],
        [13, 15],
        [6, 12],
        [12, 14],
        [14, 16],
      ];

      // // Draw keypoints
      if (pose.keypoints[0].score > 0.5) {
        ctx.beginPath();
        ctx.arc(
          pose.keypoints[0].position.x,
          pose.keypoints[2].position.y - 20,
          60,
          0,
          2 * Math.PI
        );
        ctx.fillStyle = "blue";
        ctx.fill();
      }

      // Draw skeleton
      skeleton.forEach(([startIdx, endIdx]) => {
        const startKeypoint = pose.keypoints[startIdx];
        const endKeypoint = pose.keypoints[endIdx];

        if (startKeypoint.score > 0.5 && endKeypoint.score > 0.5) {
          ctx.beginPath();
          ctx.moveTo(startKeypoint.position.x, startKeypoint.position.y);
          ctx.lineTo(endKeypoint.position.x, endKeypoint.position.y);
          ctx.lineWidth = 20;
          ctx.strokeStyle = "blue";
          ctx.stroke();
        }
      });
    }
  };

  const renderer = ({ total, completed }) => {
    if (completed || countdownCompleted) {
      return <span className="title">Posing!</span>;
    } else {
      const secondsLeft = Math.floor(total / 1000);
      return <span className="title">{secondsLeft} </span>;
    }
  };

  return (
    <>
      <Countdown
        key={countdownKey}
        date={Date.now() + 3000}
        renderer={renderer}
        onComplete={capture}
      />
      <div className="window_box">
        <Webcam
          className="window"
          audio={false}
          width={960}
          height={540}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
        />
        <canvas
          className="window"
          ref={canvasRef}
          width={960}
          height={540}
          style={{
            pointerEvents: "none",
          }}
        />
      </div>
    </>
  );
}

export default App;
