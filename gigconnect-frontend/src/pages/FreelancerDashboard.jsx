const FreelancerDashboard = () => {
    return (
      <div className="min-h-screen bg-background p-8">
  
        {/* Header */}
        <h1 className="text-3xl font-bold text-textDark mb-8">
          Freelancer Dashboard
        </h1>
  
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col md:flex-row gap-6 mb-8">
          
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold">
            👤
          </div>
  
          <div>
            <h2 className="text-2xl font-semibold text-textDark">
              John Doe
            </h2>
            <p className="text-gray-600">Full Stack Developer</p>
            <p className="text-sm text-gray-500 mt-1">
              Experience Level: Intermediate
            </p>
  
            <div className="flex flex-wrap gap-2 mt-3">
              {["React", "Java", "Spring Boot", "MySQL"].map(skill => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-accent text-secondary text-sm rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
  
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          <div className="bg-white rounded-xl p-6 shadow">
            <p className="text-gray-500 text-sm">Completed Jobs</p>
            <h3 className="text-2xl font-bold text-textDark">24</h3>
          </div>
  
          <div className="bg-white rounded-xl p-6 shadow">
            <p className="text-gray-500 text-sm">Total Earnings</p>
            <h3 className="text-2xl font-bold text-textDark">₹1,20,000</h3>
          </div>
  
          <div className="bg-white rounded-xl p-6 shadow">
            <p className="text-gray-500 text-sm">Rating</p>
            <h3 className="text-2xl font-bold text-textDark">4.8 ⭐</h3>
          </div>
  
        </div>
  
        {/* CTA */}
        <div className="bg-primary text-white rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">Ready for more work?</h3>
            <p className="text-sm opacity-90">
              Create a new gig and start earning today.
            </p>
          </div>
  
          <button className="mt-4 md:mt-0 px-6 py-3 bg-accent text-secondary rounded-xl font-semibold">
            Create Gig
          </button>
        </div>
  
      </div>
    );
  };
  
  export default FreelancerDashboard;
  