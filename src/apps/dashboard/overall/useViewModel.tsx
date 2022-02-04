import { IBaseData } from "model";
import { useState, useEffect } from "react";
import { getData } from "../../../service/getData";

interface IObjectData {
  index: number;
  data: IBaseData;
}

interface IObjectError {
  index: number;
  pos: number;
}

const useViewModel = () => {
  const [data, setData] = useState<IBaseData[]>([]);
  const [holdData, setHoldData] = useState<
    { index: number; data: IBaseData }[]
  >([]);
  const [errorsRows, setErrorsRows] = useState([0, 2]);
  const [errorPos, setErrorPos] = useState<{ index: number; pos: number }[]>(
    []
  );
  const [toggle, setToggle] = useState(false);

  const createHoldDataObject = (curData: IBaseData[]) => {
    let dataObject: IObjectData[] = [];

    curData.forEach((item, index) => {
      let newObject = { index, data: item };

      dataObject.push(newObject);
    });

    return dataObject;
  };

  const removeData = (
    index: number,
    curData: { index: number; data: IBaseData }[]
  ) => {
    curData.splice(index, 1);

    let lowerData: IObjectData[] = [];
    let upperData: IObjectData[] = [];

    curData.forEach((data) => {
      if (data.index < index) {
        lowerData.push(data);
      }
      if (data.index > index) {
        upperData.push(data);
      }
    });

    let newUpperData = upperData.map((item) => {
      const { index, data } = item;

      return { index: index - 1, data };
    });

    let sumData = [...lowerData, ...newUpperData];

    return sumData;
  };

  const removeError = (index: number, curError: IObjectError[]) => {
    let lowerError: IObjectError[] = [];
    let upperError: IObjectError[] = [];

    let spliceErr = curError.filter((err) => {
      if (err.pos !== index) {
        return err;
      }
    });

    spliceErr.forEach((item) => {
      if (item.pos < index) {
        lowerError.push(item);
      }
      if (item.pos > index) {
        upperError.push(item);
      }
    });

    let newUpperError = upperError.map((item) => {
      const { index, pos } = item;

      return { index: index - 1, pos: pos - 1 };
    });

    let sumError = [...lowerError, ...newUpperError];

    return sumError;
  };

  const removeToggleData = (index: number, curData: IBaseData[]) => {
    let lowerData: IObjectData[] = [];
    let upperData: IObjectData[] = [];

    let removed = curData.filter((data) => data.id === index);
    let getLeftData = holdData.filter((val) => !removed.includes(val.data));

    getLeftData.forEach((data) => {
      if (data.index < index) {
        lowerData.push(data);
      }
      if (data.index > index) {
        upperData.push(data);
      }
    });

    let newUpperData = upperData.map((item) => {
      const { index, data } = item;

      return { index: index - 1, data };
    });

    let sumData = [...lowerData, ...newUpperData];

    return sumData;
  };

  const onRemoveData = (index: number) => {
    if (toggle) {
      let curData = data;
      let curError = errorPos;

      let removed = curData.filter((data) => data.id === index);
      let leftData = removeToggleData(index, curData);
      let newCurData = curData.filter((data) => !removed.includes(data));

      let leftError = removeError(index, curError);
      let curLeftError = leftError.map((err) => err.pos - 1);

      setData(newCurData);
      setHoldData(leftData);

      setErrorPos(leftError);
      setErrorsRows(curLeftError);
    }
    if (!toggle) {
      let curData = holdData;
      let curError = errorPos;

      let leftData = removeData(index, curData);
      let curLeftData = leftData.map((data) => data.data);

      setHoldData(leftData);
      setData(curLeftData);

      let leftError = removeError(index, curError);
      let curLeftError = leftError.map((err) => err.pos);

      setErrorPos(leftError);
      setErrorsRows(curLeftError);
    }
    return null;
  };

  const onDuplicateData = () => {
    return false;
  };

  const orderError = (arrayOfError: number[], errorData: IBaseData[]) => {
    let array: number[] = [];

    for (let index = 0; index < errorData.length; index++) {
      array.push(index);
    }

    let errorPosArray: { index: number; pos: number }[] = [];
    arrayOfError.forEach((error, index) => {
      let newErrorObj = { index, pos: error };

      errorPosArray.push(newErrorObj);
    });

    return errorPosArray;
  };

  const toggleTrue = () => {
    let getErrorData = holdData.filter((val) => errorsRows.includes(val.index));
    let errorData = getErrorData.map((item) => item.data);

    setData(errorData);

    let newErrorPos = orderError(errorsRows, errorData);
    let newRowsErrors = newErrorPos.map((item) => item.index);

    setErrorPos(newErrorPos);
    setErrorsRows(newRowsErrors);

    return false;
  };

  const toggleFalse = () => {
    let setDataBack = holdData.map((item) => item.data);
    setData(setDataBack);

    let setErrorPosBack = errorPos.map((error) => error.pos);
    setErrorsRows(setErrorPosBack);

    return false;
  };

  useEffect(() => {
    if (holdData.length === 0) {
      console.log("fetch");
      getData().then((res) => {
        let dataObject: IObjectData[] = [];
        let errorObject: IObjectError[] = [];

        res.forEach((item, index) => {
          let newObject = { index, data: item };

          dataObject.push(newObject);
        });

        errorsRows.forEach((item, index) => {
          let newErrorObj = { index, pos: item };

          errorObject.push(newErrorObj);
        });

        setData(res);
        setHoldData(dataObject);
        setErrorPos(errorObject);
      });
    }
    if (holdData.length !== 0) {
      if (toggle) {
        toggleTrue();
      }
      if (!toggle) {
        toggleFalse();
      }
    }
  }, [toggle]);

  return {
    data,
    setData,
    errorsRows,
    onRemoveData,
    onDuplicateData,
    toggle,
    setToggle,
  };
};

export default useViewModel;

// curData.splice(index, 1);
// let errorPos = arrayDiff(errorsRows);
// errorPos.forEach((item, Itemindex) => {
//   if (Itemindex < index) {
//     lowerErr.push(item);
//   }
//   if (Itemindex > index) {
//     higherErr.push(item);
//   }
// });
// let sumErrorPos = [...lowerErr, ...higherErr];
// let newErrorPos = sumErrorPos.map((i) => {
//   if (i > 0) {
//     return i - 1;
//   } else {
//     return i;
//   }
// });

// let newErrorsRows = newErrorPos.filter((i) => i >= 0);

// const removeToggleError = (index: number, curError: IObjectError[]) => {
//   let lowerError: IObjectError[] = [];
//   let upperError: IObjectError[] = [];

//   let spliceErr = curError.filter((err) => {
//     if (err.pos !== index) {
//       return err;
//     }
//   });

//   spliceErr.forEach((item) => {
//     if (item.pos < index) {
//       lowerError.push(item);
//     }
//     if (item.pos > index) {
//       upperError.push(item);
//     }
//   });

//   let newUpperError = upperError.map((item) => {
//     const { index, pos } = item;

//     return { index: index - 1, pos: pos - 1 };
//   });

//   let sumError = [...lowerError, ...newUpperError];

//   return sumError;
// };

// const arrayDiff = (arrayOfError: number[], data: IBaseData[]) => {
//   let newerrorPos: number[] = [];
//   let array: number[] = [];

//   for (let index = 0; index <= data.length; index++) {
//     array.push(index);
//   }

//   array.filter(function (i) {
//     if (arrayOfError.indexOf(i) < 0) {
//       newerrorPos.push(-1);
//     } else {
//       newerrorPos.push(array.indexOf(i));
//     }
//   });

//   return newerrorPos;
// };
