
import Poll from "./components/Poll";
import Leaderboard from "./components/Leaderboard";
import UpdateWinner from "./components/Updatewinner";


export default function Home() {
  return (
    <div className="max-w-4xl mx-auto p-4 flex flex-col gap-6">
    {/* Poll Section */}
    <section className="bg-white p-6 rounded-lg shadow-md">
      <Poll />
    </section>

    {/* Leaderboard Section */}
    <section className="bg-white p-6 rounded-lg shadow-md">
      <Leaderboard />
    </section>

    <section className="bg-white p-6 rounded-lg shadow-md">
      <UpdateWinner />
    </section>
  </div>
  );
}
