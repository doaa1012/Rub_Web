import React from 'react';
import { Link } from 'react-router-dom';

const AreaA = () => {
  const projects = [
    {
      id: 'a01',
      title: 'A01 - Theoretical electrochemistry',
      description:
        'Detailed information about A01 - Theoretical electrochemistry of CCSS surfaces and high-throughput exploration of CCSS thin film systems.',
      gradient: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    },
    {
      id: 'a02',
      title: 'A02 - Microstructure design',
      description:
        'Detailed information about A02 - Microstructure design of quasi-single crystalline and smooth model thin films.',
      gradient: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
    },
    {
      id: 'a03',
      title: 'A03 - Simulation of segregation',
      description:
        'Detailed information about A03 - Simulation of segregation and ordering at CCSS surfaces.',
      gradient: 'from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700',
    },
    {
      id: 'a04',
      title: 'A04 - Ab initio simulations',
      description:
        'Detailed information about A04 - Ab initio simulations of electrochemical reactions at CCSS surfaces.',
      gradient: 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
    },
    {
      id: 'a05',
      title: 'A05 - Data-guided experimentation',
      description:
        'Detailed information about A05 - Data-guided experimentation and machine learning.',
      gradient: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
    },
    {
      id: 'a06',
      title: 'A06 - Knowledge graph design',
      description:
        'Detailed information about A06 - Establishing a knowledge graph for the design of CCSS.',
      gradient: 'from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700',
    },
  ];

  return (
    <div className="p-8 bg-gradient-to-r from-blue-50 via-white to-blue-50 min-h-screen">
      {/* Area A Main Section */}
      <section
        id="area-a-main"
        className="mb-12 bg-white shadow-lg rounded-2xl p-8 border-t-4 border-blue-500 transition-transform hover:scale-105"
      >
        <h2 className="text-4xl font-extrabold text-blue-800 mb-6">
          Research Area A
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed mb-6">
          Research area A: Theory, simulation, data-guided design, and synthesis
          of CCSS surfaces.
        </p>
        <p className="text-lg text-gray-600 leading-relaxed mb-6">
          Two projects (A01-Ludwig, A02) will synthesize the thin films for the
          CRC. Three projects are working on theory and simulation of SAA and
          CCSS (A01-Rossmeisl, A03, A04), and two projects on materials
          informatics (A05, A06). The projects A01-Ludwig and A02 are the
          synthesis projects of the CRC and provide its consistent materials
          platform, which has the advantage to provide perfect sample and data
          lineage tracking as well as ideal comparability of all materials, as
          all films are from one source...
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`/${project.id}`}
              className={`p-4 rounded-xl text-center bg-gradient-to-r ${project.gradient} text-white font-semibold shadow-md hover:shadow-xl transition-transform hover:scale-105`}
            >
              {project.title}
            </Link>
          ))}
        </div>
      </section>

      {/* Individual Project Sections */}
      {projects.map((project) => (
        <section
          key={project.id}
          id={project.id}
          className="mb-8 bg-white shadow-lg rounded-2xl p-6 border-l-4 border-blue-400 transition-transform hover:scale-105"
        >
          <h3 className="text-2xl font-bold text-blue-800 mb-4">
            {project.title}
          </h3>
          <p className="text-lg text-gray-600 leading-relaxed">
            {project.description}
          </p>
        </section>
      ))}
    </div>
  );
};

export default AreaA;
