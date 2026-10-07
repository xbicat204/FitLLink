import MainLayout from "@/layouts/MainLayout";

export default function NewsPage() {
  return (
    <MainLayout>
      <div className="h-[600px]  bg-[rgb(162,199,236)] flex flex-col md:flex-row items-center px-6 md:px-28 pt-[140px]">
        <div className="flex-1 space-y-4 h-56">
          <h1 className="text-5xl font-black leading-tight">News</h1>
          <p className="text-gray-700">
            We are your local dog home boarding service giving you complete
          </p>
        </div>
        <div className="flex-1 mt-10 md:mt-0">
          <img src="" alt="" className="w-full max-w-md mx-auto" />
        </div>
      </div>
    </MainLayout>
  );
}
