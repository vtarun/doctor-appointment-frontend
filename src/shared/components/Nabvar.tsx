import { NavLink } from "react-router-dom";
import { NavbarRoleBasedLinks } from "../constants";
import type { UserRoleType } from "../types";


interface NavbarProps {
    role: UserRoleType;
}

const Navbar = ({ role }: NavbarProps) => {
    const links = NavbarRoleBasedLinks[role];

    return (
        <nav>
            <ul>
                {links.map(({to, label}) => (
                    <li key={to}>
                        <NavLink to={to}>{label}</NavLink>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default Navbar;
