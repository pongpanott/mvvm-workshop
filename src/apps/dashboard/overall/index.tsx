import Toggle from "baseUI/button/toggle";
import { Table, TableBody } from "baseUI/table";
import { TableColumn } from "./components/tableColumn";
import { TableRow } from "./components/tableRow";
import useViewModel from "./useViewModel";

export const OverallPage = () => {
	const { data, errorsRows, onRemoveData, onDuplicateData, toggle, setToggle } =
		useViewModel();

	return (
		<div className=" p-8 pt-[72px] mx-auto">
			<Toggle enabled={toggle} setEnabled={() => setToggle(!toggle)} />
			<Table>
				<TableColumn />
				<TableBody>
					{data.map((entry, index) => (
						<TableRow
							data={entry}
							index={index}
							onRemove={() => onRemoveData(index)}
							onDuplicateData={() => onDuplicateData(index)}
							error={errorsRows.includes(index)}
						/>
					))}
				</TableBody>
			</Table>
		</div>
	);
};
