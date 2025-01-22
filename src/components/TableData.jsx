import PropTypes from "prop-types";

export default function TableData({ headers, data }) {
    return (
        <table className="items-center w-full mb-0 align-top border-gray-200 text-black backdrop-blur-sm bg">
            <thead className="border-b bg-gray-100 text-gray-800 font-semibold">
                <tr className="py-2 pl-2">
                    {headers.map((header, index) => (
                        <th key={index}>{header}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {data.map((item, rowIndex) => (
                    <tr key={rowIndex} className="hover:shadow-lg border transition duration-200">
                        {headers.map((header, colIndex) => (
                            <td key={colIndex} className="py-3 pl-2">{item[header]}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

TableData.propTypes = {
    headers: PropTypes.arrayOf(PropTypes.string).isRequired,
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
};