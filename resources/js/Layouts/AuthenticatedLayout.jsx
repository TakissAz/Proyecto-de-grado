/* global route */

import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const { auth } = usePage().props;
    const user = auth?.user;

    const roleNames = useMemo(
        () => user?.roles?.map((role) => role.nombre) ?? [],
        [user?.roles],
    );

    const isAdmin = roleNames.includes('administrador');
    const isEndocrinologo = !isAdmin && roleNames.includes('endocrinologo');
    const isNutricionista = !isAdmin && !isEndocrinologo && roleNames.includes('nutricionista');

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    const dashboardHref = route('dashboard');

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="border-b border-gray-100 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href={dashboardHref}>
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                                </Link>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                <NavLink
                                    href={dashboardHref}
                                    active={route().current('dashboard')}
                                >
                                    Dashboard
                                </NavLink>

                                {isAdmin ? (
                                    <>
                                        <NavLink
                                            href={route('admin.users.index')}
                                            active={route().current('admin.users.*')}
                                        >
                                            Usuarios
                                        </NavLink>

                                        <NavLink
                                            href={route('admin.auditoria.pacientes')}
                                            active={route().current('admin.auditoria.*')}
                                        >
                                            Auditoria
                                        </NavLink>
                                    </>
                                ) : null}

                                {isNutricionista ? (
                                    <NavLink
                                        href={route('nutricionista.pacientes.index')}
                                        active={route().current('nutricionista.pacientes.*')}
                                    >
                                        Pacientes
                                    </NavLink>
                                ) : null}

                                {isEndocrinologo ? (
                                    <NavLink
                                        href={route('endocrinologo.pacientes.index')}
                                        active={route().current('endocrinologo.pacientes.*')}
                                    >
                                        Pacientes
                                    </NavLink>
                                ) : null}
                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none"
                                            >
                                                {user?.name ?? 'Usuario'}

                                                <svg
                                                    className="-me-0.5 ms-2 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link href={route('profile.edit')}>
                                            Perfil
                                        </Dropdown.Link>

                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                        >
                                            Cerrar sesion
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden'
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink
                            href={dashboardHref}
                            active={route().current('dashboard')}
                        >
                            Dashboard
                        </ResponsiveNavLink>

                        {isAdmin ? (
                            <>
                                <ResponsiveNavLink
                                    href={route('admin.users.index')}
                                    active={route().current('admin.users.*')}
                                >
                                    Usuarios
                                </ResponsiveNavLink>

                                <ResponsiveNavLink
                                    href={route('admin.auditoria.pacientes')}
                                    active={route().current('admin.auditoria.*')}
                                >
                                    Auditoria
                                </ResponsiveNavLink>
                            </>
                        ) : null}

                        {isNutricionista ? (
                            <ResponsiveNavLink
                                href={route('nutricionista.pacientes.index')}
                                active={route().current('nutricionista.pacientes.*')}
                            >
                                Pacientes
                            </ResponsiveNavLink>
                        ) : null}

                        {isEndocrinologo ? (
                            <ResponsiveNavLink
                                href={route('endocrinologo.pacientes.index')}
                                active={route().current('endocrinologo.pacientes.*')}
                            >
                                Pacientes
                            </ResponsiveNavLink>
                        ) : null}
                    </div>

                    <div className="border-t border-gray-200 pb-1 pt-4">
                        <div className="px-4">
                            <div className="text-base font-medium text-gray-800">
                                {user?.name ?? 'Usuario'}
                            </div>
                            <div className="text-sm font-medium text-gray-500">
                                {user?.email ?? ''}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                Perfil
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                Cerrar sesion
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white shadow">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
