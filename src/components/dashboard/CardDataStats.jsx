import PropTypes from "prop-types";

export default function CardDataStats({
                                          title,
                                          total,
                                          children,
                                      }) {
    return (
        <div className="rounded-lg border border-stroke bg-white py-6 px-7 shadow-default">
            <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2">
                {children}
            </div>
            <div className="mt-4 flex items-end justify-between gap-2">
                <span className="text-sm font-medium">{title}</span>
                <h4 className="text-title-md font-bold text-black dark:text-white">
                    {total}
                </h4>

            </div>
        </div>
    );
};

CardDataStats.propTypes = {
    title: PropTypes.string,
    total: PropTypes.number,
    children: PropTypes.node,
}