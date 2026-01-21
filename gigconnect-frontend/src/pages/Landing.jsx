import { motion } from "framer-motion";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center overflow-hidden">
      
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center space-y-8 px-4"
      >
        
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-6xl md:text-7xl font-extrabold text-textDark"
        >
          Connect. Create.{" "}
          <span className="text-primary">Earn.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-lg text-gray-600 max-w-xl mx-auto"
        >
          GigConnect is a modern freelancing platform where clients hire top
          talent and freelancers build careers.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9 }}
          className="flex justify-center gap-6"
        >
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-primary text-white rounded-xl shadow-lg"
          >
            Find Work
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 border-2 border-primary text-primary rounded-xl"
          >
            Hire Talent
          </motion.button>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default Landing;
