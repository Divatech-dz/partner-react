// SalesView.jsx (updated)
import CardDataStats from "../components/dashboard/CardDataStats.jsx";
import ChartOne from "../components/dashboard/ChartOne.jsx";
import ChartTwo from "../components/dashboard/ChartTwo.jsx";
import ChartThree from "../components/dashboard/ChartThree.jsx";
import TableOne from "../components/dashboard/TableOne.jsx";
import {useDeliveryContext} from "../context/DeliveryContext.js";
import {useWarrantiesContext} from "../context/WarrantiesContext.js";
import {useReturnsContext} from "../context/ReturnsContext.js";
import {useOrderContext} from "../context/OrderContext.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx"; // Import the spinner

export default function SalesView(){
  const {deliveryNotes, loading: deliveryLoading} = useDeliveryContext();
  const {warranties, loading: warrantiesLoading} = useWarrantiesContext();
  const {returns, loading: returnsLoading} = useReturnsContext();
  const {orderItems, loading: ordersLoading} = useOrderContext();

  // Check if any data is still loading
  const isLoading = deliveryLoading || warrantiesLoading || returnsLoading || ordersLoading;

  // Show loading spinner while data is being fetched
  if (isLoading) {
    return (
      <section className="py-10 px-5">
        <LoadingSpinner />
      </section>
    );
  }

  return (
      <section className="py-10 px-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
          <CardDataStats title="Total des bons de livraison" total={deliveryNotes.length}>
            {/* SVG content remains the same */}
          </CardDataStats>
          <CardDataStats title="Total bon de garantie" total={warranties.length}>
            {/* SVG content remains the same */}
          </CardDataStats>
          <CardDataStats title="Total bon de retour" total={returns.length}>
            {/* SVG content remains the same */}
          </CardDataStats>
          <CardDataStats title="Total des commandes" total={orderItems.length}>
            {/* SVG content remains the same */}
          </CardDataStats>
        </div>

        <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
          <ChartOne/>
          <ChartTwo/>
          <div className="col-span-12 xl:col-span-7">
            <TableOne/>
          </div>
          <ChartThree/>
        </div>
      </section>
  );
};