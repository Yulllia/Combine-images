import Image from "next/image";
import axios from "axios";
import { useState, useRef, ChangeEvent } from "react";
import Spinner from "./Spinner";

export const Home = () => {
  const [image, setImage] = useState<Array<string> | null>([]);
  const [files, setFiles] = useState<FileList | File[] | null>();
  const [loading, setLoading] = useState<boolean>(false);
  const [disable, setDisable] = useState<boolean>(true);
  const [info, setInfo] = useState<Array<ImageInfo>>();
  const [combine, setCombine] = useState<string>("");
  const [isFunction, isFunctionCalled] = useState<boolean>(false);
  const fileInput = useRef<HTMLInputElement>();
  let result = combine.slice(7, combine.length);

  interface ImageInfo {
    destination: string;
    encoding: string;
    fieldname: string;
    filename: string;
    mimetype: string;
    originalname: string;
    path: string;
    size: number;
  }
  const renderPhotos = (source: string[]) => {
    if (source.length > 2) {
      source.length = 2;
    }
    return source.map((photo: string) => {
      return (
        <div className="image-block" key={photo}>
          <Image key={photo} src={photo} width={300} height={200} alt="photo" />
        </div>
      );
    });
  };

  const onSubmit = (e: { preventDefault: () => void }): void => {
    setLoading(true);
    e.preventDefault();
    setDisable(false);
    const data = new FormData();
    if (image!.length > 1) {
      for (let i = 0; i < 2; i++) {
        data.append("file", files![i]);
      }
    }
    axios
      .post("//localhost:3000/api/images", data)
      .then((response) => {
        setCombine(response.data.path);
        setInfo(response.data.req);
      })
      .catch((e) => {
        console.log("Error", e);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  function clearImages() {
    setLoading(true);
    let pathName = info?.map((element) => element.originalname);
    let pathNameCombine = pathName!.concat(result.toString());
    if (pathNameCombine !== undefined) {
      for (let i = 0; i < pathNameCombine.length; i++) {
        axios
          .delete(`//localhost:3000/api/${pathNameCombine[i]}`)
          .then((response) => {
            isFunctionCalled(true);
          })
          .catch((e) => {
            console.log("Error", e);
          })
          .finally(() => {
            setLoading(false);
          });
      }
    }

    setImage([]);
    fileInput.current!.value = "";
    setCombine("");
  }

  const renderImage = (combine: string) => {
    if (combine) {
      return (
        <div>
          <Image src={`/${result}`} width={500} height={300} alt="image" />
        </div>
      );
    }
  };

  return (
    <div>
      <h1 className="title">COMBINE IMAGES</h1>
      <form
        method="post"
        action="#"
        id="#"
        onSubmit={onSubmit}
        className="form-container"
      >
        <input
          multiple
          accept=".jpeg, .png, .bmp, .tiff, .gif"
          className="input-style"
          id="input"
          type="file"
          name="choose file"
          ref={fileInput as React.MutableRefObject<HTMLInputElement>}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            if (event.target.files) {
              isFunctionCalled(false);
              setDisable(false);
              setFiles(event.target.files);
              if (files) {
                const a = Object.assign({}, files);
                a[1] = event.target.files[0];
                setFiles(a);
              } else {
                setFiles(event.target.files);
              }
              const filterArray = Array.from(event.target.files).map((file) =>
                URL.createObjectURL(file)
              );
              if (isFunction) {
                setFiles((event.target.files = null));
                setFiles(event.target.files);
              }
              if (image) {
                setImage((previmage) => previmage!.concat(filterArray));
              } else {
                setImage(null);
              }
            }
          }}
        />
        <div>{image && renderPhotos(image)}</div>
        <button className="submit-button" type="submit" disabled={disable}>
          Combine images
        </button>
        <button
          onClick={clearImages}
          className="combine-button btn"
          type="submit"
          disabled={disable}
        >
          Clear all images
        </button>
        <div>
          {loading ? (
            <Spinner />
          ) : image!.length >= 2 ? (
            combine && renderImage(combine)
          ) : (
            <p>Upload 2 file images</p>
          )}
        </div>
      </form>
    </div>
  );
};

export default Home;
