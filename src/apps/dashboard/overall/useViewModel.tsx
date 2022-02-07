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

		curError.forEach((item) => {
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

		let removed = curData.filter((data, dataIndex) => dataIndex === index);
		let getLeftData = holdData.filter((val) => !removed.includes(val.data));

		getLeftData.forEach((data) => {
			if (data.index <= index) {
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

			let removed = curData.filter((data, dataIndex) => dataIndex === index);
			let leftData = removeToggleData(index, curData);
			let newCurData = curData.filter((data) => !removed.includes(data));

			let leftError = removeError(index, curError);
			let curLeftError = leftError.map((err) => {
				if (err.pos === 0) {
					return err.pos;
				} else {
					return err.pos - 1;
				}
			});

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

	const duplicateData = (
		index: number,
		duplicate: IBaseData[],
		curData: IBaseData[]
	) => {
		let lowerData: IBaseData[] = [];
		let upperData: IBaseData[] = [];

		curData.forEach((data) => {
			if (data.id < index) {
				lowerData.push(data);
			}
			if (data.id >= index) {
				upperData.push(data);
			}
		});

		let createDuplicate = duplicate.map((item) => {
			let newDup = { ...item, id: item.id + 1 };

			return newDup;
		});

		let newUpperData = upperData.map((item) => {
			let newUpper = { ...item, id: item.id + 1 };
			return newUpper;
		});

		let sumData = [...lowerData, createDuplicate[0], ...newUpperData];

		return sumData;
	};

	const duplicateError = (index: number, curError: IObjectError[]) => {
		let lowerError: IObjectError[] = [];
		let upperError: IObjectError[] = [];

		let findError = curError.filter((err) => err.pos === index);

		let newError = findError.map((item) => {
			let newObjError = { index: item.index + 1, pos: item.pos + 1 };

			return newObjError;
		});

		curError.forEach((err) => {
			if (err.pos <= index) {
				lowerError.push(err);
			}
			if (err.pos > index) {
				upperError.push(err);
			}
		});

		let newUpperError = upperError.map((item) => {
			let newObjError = { index: item.index + 1, pos: item.pos + 1 };

			return newObjError;
		});

		let sumError = [...lowerError, ...newError, ...newUpperError];

		return sumError;
	};

	const duplicateToggleError = (index: number, curError: IObjectError[]) => {
		let lowerError: IObjectError[] = [];
		let upperError: IObjectError[] = [];

		let findError = curError.filter((err) => err.index === index);

		let newError = findError.map((item) => {
			let newObjError = { index: item.index + 1, pos: item.pos + 1 };

			return newObjError;
		});

		curError.forEach((err) => {
			if (err.index <= index) {
				lowerError.push(err);
			}
			if (err.index > index) {
				upperError.push(err);
			}
		});

		let newUpperError = upperError.map((item) => {
			let newObjError = { index: item.index + 1, pos: item.pos + 1 };

			return newObjError;
		});

		let sumError = [...lowerError, ...newError, ...newUpperError];

		return sumError;
	};

	const onDuplicateData = (index: number) => {
		if (toggle) {
			let curData = data;
			let curError = errorPos;
			let newHoldData: IObjectData[] = [];
			let lowerHoldData: IObjectData[] = [];
			let upperHoldData: IObjectData[] = [];

			let duplicate = curData.filter((data, dataIndex) => dataIndex === index);
			let newData = duplicateData(index, duplicate, curData);

			holdData.forEach((item) => {
				if (item.index <= index) {
					lowerHoldData.push(item);
				}
				if (item.index > index) {
					upperHoldData.push(item);
				}
			});

			let duplicateHoldData = { index: index + 1, data: duplicate[0] };
			let newUpperHoldData = upperHoldData.map((item) => {
				let newObj = { index: item.index + 1, data: item.data };

				return newObj;
			});

			let sumHoldData = [
				...lowerHoldData,
				duplicateHoldData,
				...newUpperHoldData,
			];

			setData(newData);
			setHoldData(sumHoldData);

			let newErrorPos = duplicateToggleError(index, curError);
			let newError = newErrorPos.map((item) => item.index);

			setErrorPos(newErrorPos);
			setErrorsRows(newError);
		}
		if (!toggle) {
			let curData = data;
			let curError = errorPos;
			let newHoldData: IObjectData[] = [];

			let duplicate = curData.filter((data, dataIndex) => dataIndex === index);
			let newData = duplicateData(index, duplicate, curData);
			newData.forEach((item, index) => {
				let newObject = { index, data: item };

				newHoldData.push(newObject);
			});

			setData(newData);
			setHoldData(newHoldData);

			let newErrorPos = duplicateError(index, curError);
			let newError = newErrorPos.map((item) => item.pos);

			setErrorPos(newErrorPos);
			setErrorsRows(newError);
		}
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
