import React from 'react';
import { Link } from 'react-router-dom';

const AreaB = () => {
  const projects = [
    {
      id: 'b01',
      title: 'B01 - Accelerated Atomic-Scale Exploration of CCSS Phase Evolution',
      description:
        'Detailed information about B01 - Rapidly assesses phase stability in new CCSS, selecting thermally stable single-phase systems, and provides data on surface and GB segregation across various temperatures.',
      gradient: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    },
    {
      id: 'b02',
      title: 'B02 - Linking Surface Atomistic Configuration to Electrochemical Performance of CCSS for HER',
      description:
        'Detailed information about B02 - Investigates the elemental distribution and atomistic configurations on the surface and grain boundaries of CCSS systems.',
      gradient: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
    },
    {
      id: 'b03',
      title: 'B03 - High-Resolution Electron Microscopy of CCSS Surfaces and Defects',
      description:
        'Detailed information about B03 - Examines the impact of surface chemistry and structural order on CCSS properties, using high-resolution (S)TEM imaging.',
      gradient: 'from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700',
    },
    {
      id: 'b04',
      title: 'B04 - Advancing Analytical Field-Ion Microscopy for CCSS Catalysts',
      description:
        'Detailed information about B04 - Enhances Field-Ion Microscopy (FIM) to enable quasi-in-situ analysis of catalytically active CCSS at atomic resolution.',
      gradient: 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
    },
    {
      id: 'b05',
      title: 'B05 - Atomic-Scale Imaging of CCSS Surfaces',
      description:
        'Detailed information about B05 - Uses scanning tunneling microscopy to achieve atomic-scale imaging of CCSS surfaces, focusing on elemental composition and distribution.',
      gradient: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
    },
  ];

  return (
    <div className="p-8 bg-gradient-to-r from-blue-50 via-white to-blue-50 min-h-screen">
      {/* Area B Main Section */}
      <section
        id="area-b-main"
        className="mb-12 bg-white shadow-lg rounded-2xl p-8 border-t-4 border-blue-500 transition-transform hover:scale-105"
      >
        <h2 className="text-4xl font-extrabold text-blue-800 mb-6">
          Research Area B
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed mb-6">
          Research area B: Atomic-scale characterization of CCSS surfaces.
        </p>
        <p className="text-lg text-gray-600 leading-relaxed mb-6">
          This area focuses on understanding surface and grain boundary
          configurations at atomic resolution using advanced techniques, such as
          microscopy and spectroscopy, to optimize CCSS materials for catalytic
          applications.
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

export default AreaB;
