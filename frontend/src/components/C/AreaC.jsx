import React from 'react';
import { Link } from 'react-router-dom';

const AreaC = () => {
  const projects = [
    {
      id: 'c01',
      title: 'C01 - Electrochemical characterisation',
      description:
        'This project focuses on exploring and screening thin film materials to evaluate their catalytic activity, specifically using electrochemical techniques.',
      gradient: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    },
    {
      id: 'c02',
      title: 'C02 - Identification of active SAA using SECCM',
      description:
        'This project aims to identify regions with high activity for the hydrogen evolution reaction (HER) at the nanoscale, using advanced electrochemical microscopy.',
      gradient: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
    },
    {
      id: 'c03',
      title: 'C03 - Surface composition effects on HER',
      description:
        'This project studies how changes in surface composition through electrochemical modification influence HER activity.',
      gradient: 'from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700',
    },
    {
      id: 'c04',
      title: 'C04 - Electroactive sites under reaction conditions',
      description:
        'This project uses high-resolution microscopy to detect active catalytic sites on model surfaces under actual reaction conditions.',
      gradient: 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
    },
  ];

  return (
    <div className="p-8 bg-gradient-to-r from-blue-50 via-white to-blue-50 min-h-screen">
      {/* Area C Main Section */}
      <section
        id="area-c-main"
        className="mb-12 bg-white shadow-lg rounded-2xl p-8 border-t-4 border-blue-500 transition-transform hover:scale-105"
      >
        <h2 className="text-4xl font-extrabold text-blue-800 mb-6">
          Research Area C
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed mb-6">
          Research area C: Evaluation of CCSS surfaces using electrochemical
          tools.
        </p>
        <p className="text-lg text-gray-600 leading-relaxed mb-6">
          This area utilizes advanced electrochemical and microscopic techniques
          to evaluate catalytic activity, study active sites, and investigate
          composition effects on hydrogen evolution reactions.
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

export default AreaC;
